import { t } from '@lingui/macro';
import * as React from 'react';
import {
  CollectionAPI,
  CollectionUsedByDependencies,
  CollectionVersion,
  CollectionVersionAPI,
  CollectionVersionContentType,
  CollectionVersionSearch,
} from 'src/api';
import {
  AlertList,
  AlertType,
  CollectionDependenciesList,
  CollectionHeader,
  CollectionUsedbyDependenciesList,
  EmptyStateNoData,
  LoadingPageWithHeader,
  Main,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import { RouteProps, withRouter } from 'src/utilities';
import { ParamHelper, errorMessage, filterIsSet } from 'src/utilities';
import { loadCollection } from './base';
import './collection-dependencies.scss';

interface IState {
  collections: CollectionVersionSearch[];
  collection: CollectionVersionSearch;
  content: CollectionVersionContentType;
  dependencies_repos: CollectionVersion[];
  params: {
    page?: number;
    page_size?: number;
    collection?: string;
    sort?: string;
    version?: string;
  };
  usedByDependencies: CollectionUsedByDependencies[];
  usedByDependenciesCount: number;
  usedByDependenciesLoading: boolean;
  alerts: AlertType[];
}

class CollectionDependencies extends React.Component<RouteProps, IState> {
  private ignoredParams = ['page_size', 'page', 'sort', 'name__icontains'];
  private cancelToken: ReturnType<typeof CollectionAPI.getCancelToken>;

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    params['sort'] = !params['sort'] ? '-collection' : 'collection';

    this.state = {
      collections: [],
      collection: null,
      content: null,
      dependencies_repos: [],
      params: params,
      usedByDependencies: [],
      usedByDependenciesCount: 0,
      usedByDependenciesLoading: true,
      alerts: [],
    };
  }

  componentDidMount() {
    this.loadData(false);
  }

  render() {
    const {
      collections,
      collection,
      content,
      params,
      usedByDependencies,
      usedByDependenciesCount,
      usedByDependenciesLoading,
      alerts,
    } = this.state;

    if (collections.length <= 0) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const { collection_version: version } = collection;

    const breadcrumbs = [
      namespaceBreadcrumb,
      {
        url: formatPath(Paths.namespaceByRepo, {
          namespace: version.namespace,
          repo: this.context.selectedRepo,
        }),
        name: version.namespace,
      },
      {
        url: formatPath(Paths.collectionByRepo, {
          namespace: version.namespace,
          collection: version.name,
          repo: this.context.selectedRepo,
        }),
        name: version.name,
      },
      { name: t`Dependencies` },
    ];

    const headerParams = ParamHelper.getReduced(params, this.ignoredParams);

    const dependenciesParams = ParamHelper.getReduced(params, ['version']);

    const noDependencies = !Object.keys(version.dependencies).length;

    return (
      <React.Fragment>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <CollectionHeader
          reload={() => this.loadData(true)}
          collections={collections}
          collection={collection}
          content={content}
          params={headerParams}
          updateParams={(p) => {
            this.updateParams(this.combineParams(this.state.params, p), () =>
              this.loadData(true),
            );
          }}
          breadcrumbs={breadcrumbs}
          activeTab='dependencies'
          repo={this.context.selectedRepo}
        />
        <Main>
          <section className='body'>
            <div className='pf-c-content collection-dependencies'>
              <h1>{t`Dependencies`}</h1>
              {noDependencies &&
              !usedByDependenciesCount &&
              !filterIsSet(params, ['name__icontains']) ? (
                <EmptyStateNoData
                  title={t`No dependencies`}
                  description={t`Collection does not have any dependencies.`}
                />
              ) : (
                <>
                  <p>{t`This collections requires the following collections for use`}</p>
                  {noDependencies ? (
                    <EmptyStateNoData
                      title={t`No dependencies`}
                      description={t`Collection does not have any dependencies.`}
                    />
                  ) : (
                    <CollectionDependenciesList
                      collection={this.state.collection}
                      dependencies_repos={this.state.dependencies_repos}
                    />
                  )}
                  <p>{t`This collection is being used by`}</p>
                  <CollectionUsedbyDependenciesList
                    repo={this.context.selectedRepo}
                    usedByDependencies={usedByDependencies}
                    itemCount={usedByDependenciesCount}
                    params={dependenciesParams}
                    usedByDependenciesLoading={usedByDependenciesLoading}
                    updateParams={(p) =>
                      this.updateParams(
                        this.combineParams(this.state.params, p),
                        () => this.loadUsedByDependencies(),
                      )
                    }
                  />
                </>
              )}
            </div>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private loadData(forceReload = false) {
    this.loadCollection(forceReload, () =>
      this.loadCollectionsDependenciesRepos(() =>
        this.loadUsedByDependencies(),
      ),
    );
  }

  private loadCollectionsDependenciesRepos(callback) {
    const dependencies = this.state.collection.collection_version.dependencies;
    const dependencies_repos = [];
    const promises = [];

    Object.keys(dependencies).forEach((dependency) => {
      const [namespace, collection] = dependency.split('.');
      const version_range = dependencies[dependency];

      const dependency_repo = {
        name: collection,
        namespace: namespace,
        version_range: version_range,
        repo: '',
        path: '',
      };
      dependencies_repos.push(dependency_repo);

      const promise = this.loadDependencyRepo(dependency_repo);
      promises.push(promise);
    });

    Promise.all(promises).then(() => {
      this.setState({ dependencies_repos: dependencies_repos }, callback());
    });
  }

  private loadDependencyRepo(dependency_repo) {
    return CollectionVersionAPI.list({
      namespace: dependency_repo.namespace,
      name: dependency_repo.name,
      version_range: dependency_repo.version_range,
      page_size: 1,
    })
      .then((result) => {
        dependency_repo.repo = result.data.data[0].repository_list[0];
        dependency_repo.path = formatPath(Paths.collectionByRepo, {
          collection: dependency_repo.name,
          namespace: dependency_repo.namespace,
          repo: dependency_repo.repo,
        });
      })
      .catch(() => {
        // do nothing, dependency_repo.path and repo stays empty
        // this may mean that collection was not found - thus is not in the system.
        // user will be notified in the list of dependencies rather than alerts
      });
  }

  private loadUsedByDependencies() {
    this.setState({ usedByDependenciesLoading: true }, () => {
      if (this.cancelToken) {
        this.cancelToken.cancel('request-canceled');
      }

      this.cancelToken = CollectionAPI.getCancelToken();

      const { name, namespace } = this.state.collection.collection_version;

      CollectionAPI.getUsedDependenciesByCollection(
        namespace,
        name,
        ParamHelper.getReduced(this.state.params, ['version']),
        this.cancelToken,
      )
        .then(({ data }) => {
          this.setState({
            usedByDependencies: data.data,
            usedByDependenciesCount: data.meta.count,
            usedByDependenciesLoading: false,
          });
        })
        .catch((err) => {
          const { status, statusText } = err.response;
          if (err?.message !== 'request-canceled') {
            this.setState({
              usedByDependenciesLoading: false,
              alerts: [
                ...this.state.alerts,
                {
                  variant: 'danger',
                  title: t`Dependent collections could not be displayed.`,
                  description: errorMessage(status, statusText),
                },
              ],
            });
          }
        })
        .finally(() => {
          this.cancelToken = undefined;
        });
    });
  }

  private loadCollection(forceReload, callback) {
    loadCollection({
      forceReload,
      matchParams: this.props.routeParams,
      navigate: this.props.navigate,
      selectedRepo: this.context.selectedRepo,
      setCollection: (collections, collection, content) =>
        this.setState({ collections, collection, content }, callback),
      stateParams: this.state.params.version
        ? { version: this.state.params.version }
        : {},
    });
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private combineParams(...params) {
    return params.reduce((acc, cur) => ({ ...acc, ...cur }));
  }

  get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private separateVersion(version) {
    const v = version.match(/((\d+\.*)+)/);
    return v ? { version: v[0] } : {};
  }
}

export default withRouter(CollectionDependencies);

CollectionDependencies.contextType = AppContext;
