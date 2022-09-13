import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  CollectionAPI,
  CollectionDetailType,
  CollectionUsedByDependencies,
  CollectionVersionAPI,
  CollectionVersion,
} from 'src/api';
import {
  CollectionHeader,
  LoadingPageWithHeader,
  Main,
  CollectionDependenciesList,
  CollectionUsedbyDependenciesList,
  EmptyStateNoData,
  AlertType,
  AlertList,
  closeAlertMixin,
} from 'src/components';

import { errorMessage, filterIsSet, ParamHelper } from 'src/utilities';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

import './collection-dependencies.scss';

interface IState {
  collection: CollectionDetailType;
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

class CollectionDependencies extends React.Component<
  RouteComponentProps,
  IState
> {
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
      collection: undefined,
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
      collection,
      params,
      usedByDependencies,
      usedByDependenciesCount,
      usedByDependenciesLoading,
      alerts,
    } = this.state;

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      namespaceBreadcrumb,
      {
        url: formatPath(Paths.namespaceByRepo, {
          namespace: collection.namespace.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.namespace.name,
      },
      {
        url: formatPath(Paths.collectionByRepo, {
          namespace: collection.namespace.name,
          collection: collection.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.name,
      },
      { name: t`Dependencies` },
    ];

    const headerParams = ParamHelper.getReduced(params, this.ignoredParams);

    const dependenciesParams = ParamHelper.getReduced(params, ['version']);

    const noDependencies = !Object.keys(
      collection.latest_version.metadata.dependencies,
    ).length;

    return (
      <React.Fragment>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <CollectionHeader
          reload={() => this.loadData(true)}
          collection={collection}
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
    const dependencies =
      this.state.collection.latest_version.metadata.dependencies;
    const dependencies_repos = [];
    const promises = [];

    Object.keys(dependencies).forEach((dependency) => {
      const [namespace, collection] = dependency.split('.');
      const dependency_repo = {
        name: collection,
        namespace: namespace,
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
    })
      .then((result) => {
        dependency_repo.repo = result.data.data[0].repository_list[0];
        const dependencies =
          this.state.collection.latest_version.metadata.dependencies;

        dependency_repo.path = formatPath(
          Paths.collectionByRepo,
          {
            collection: dependency_repo.name,
            namespace: dependency_repo.namespace,
            repo: dependency_repo.repo,
          },
          this.separateVersion(
            dependencies[
              dependency_repo.namespace + '.' + dependency_repo.name
            ],
          ),
        );
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

      CollectionAPI.getUsedDependenciesByCollection(
        this.state.collection.namespace.name,
        this.state.collection.name,
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
    CollectionAPI.getCached(
      this.props.match.params['namespace'],
      this.props.match.params['collection'],
      this.context.selectedRepo,
      this.state.params.version ? { version: this.state.params.version } : {},
      forceReload,
    )
      .then((result) => {
        this.setState({ collection: result }, callback);
      })
      .catch(() => {
        this.props.history.push(Paths.notFound);
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
