import { t } from '@lingui/macro';
import React, { Component } from 'react';
import {
  CollectionAPI,
  type CollectionUsedByDependencies,
  type CollectionVersion,
  CollectionVersionAPI,
} from 'src/api';
import {
  AlertList,
  CollectionDependenciesList,
  CollectionHeader,
  CollectionUsedbyDependenciesList,
  EmptyStateNoData,
  LoadingPage,
  Main,
  closeAlert,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import {
  ParamHelper,
  type RouteProps,
  jsxErrorMessage,
  withRouter,
} from 'src/utilities';
import { type IBaseCollectionState, loadCollection } from './base';
import './collection-dependencies.scss';

interface IState extends IBaseCollectionState {
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
}

class CollectionDependencies extends Component<RouteProps, IState> {
  static contextType = AppContext;

  private ignoredParams = ['page_size', 'page', 'sort', 'name__icontains'];

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    params['sort'] = !params['sort'] ? '-collection' : 'collection';

    this.state = {
      actuallyCollection: null,
      alerts: [],
      collection: null,
      collections: [],
      collectionsCount: 0,
      content: null,
      dependencies_repos: [],
      params,
      usedByDependencies: [],
      usedByDependenciesCount: 0,
      usedByDependenciesLoading: true,
    };
  }

  componentDidMount() {
    this.loadData(false);
  }

  render() {
    const {
      actuallyCollection,
      alerts,
      collection,
      collections,
      collectionsCount,
      content,
      params,
      usedByDependencies,
      usedByDependenciesCount,
      usedByDependenciesLoading,
    } = this.state;

    if (collections.length <= 0) {
      return <LoadingPage />;
    }

    const { collection_version: version, repository } = collection;

    const breadcrumbs = [
      namespaceBreadcrumb(),
      {
        url: formatPath(Paths.namespaceDetail, {
          namespace: version.namespace,
        }),
        name: version.namespace,
      },
      {
        url: formatPath(Paths.collectionByRepo, {
          namespace: version.namespace,
          collection: version.name,
          repo: repository.name,
        }),
        name: version.name,
      },
      { name: t`Dependencies` },
    ];

    const headerParams = ParamHelper.getReduced(params, this.ignoredParams);

    const dependenciesParams = ParamHelper.getReduced(params, ['version']);

    const noDependencies = !Object.keys(version.dependencies).length;

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        <CollectionHeader
          activeTab='dependencies'
          actuallyCollection={actuallyCollection}
          breadcrumbs={breadcrumbs}
          collection={collection}
          collections={collections}
          collectionsCount={collectionsCount}
          content={content}
          params={headerParams}
          reload={() => this.loadData(true)}
          updateParams={(p) => {
            this.updateParams(p, () => this.loadData(true));
          }}
        />
        <Main>
          <section className='body'>
            <div className='pf-v5-c-content collection-dependencies'>
              <h1>{t`Dependencies`}</h1>
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
            </div>
            <CollectionUsedbyDependenciesList
              usedByDependencies={usedByDependencies}
              itemCount={usedByDependenciesCount}
              params={dependenciesParams}
              usedByDependenciesLoading={usedByDependenciesLoading}
              updateParams={(p) =>
                this.updateParams(p, () => this.loadUsedByDependencies())
              }
            />
          </section>
        </Main>
      </>
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
        namespace,
        version_range,
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
        const [collection] = result.data.data;

        dependency_repo.repo = collection.repository.name;
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
      const { name, namespace } = this.state.collection.collection_version;

      // FIXME: We have to use CollectionAPI here for used by dependencies
      // because cross repo collection search doesn't allow `name__icontains` filter
      CollectionAPI.getUsedDependenciesByCollection(
        namespace,
        name,
        ParamHelper.getReduced(this.state.params, ['version']),
      )
        .then(({ data }) => {
          this.setState({
            usedByDependencies: data.data,
            usedByDependenciesCount: data.meta.count,
            usedByDependenciesLoading: false,
          });
        })
        .catch(({ response }) => {
          const { status, statusText } = response;
          this.setState({
            usedByDependenciesLoading: false,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Dependent collections could not be displayed.`,
                description: jsxErrorMessage(status, statusText),
              },
            ],
          });
        });
    });
  }

  private loadCollection(forceReload, callback) {
    loadCollection({
      forceReload,
      matchParams: this.props.routeParams,
      navigate: this.props.navigate,
      setCollection: (
        collections,
        collection,
        content,
        collectionsCount,
        actuallyCollection,
      ) =>
        this.setState(
          {
            collections,
            collection,
            content,
            collectionsCount,
            actuallyCollection,
          },
          callback,
        ),
      stateParams: this.state.params.version
        ? { version: this.state.params.version }
        : {},
    });
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }

  private separateVersion(version) {
    const v = version.match(/((\d+\.*)+)/);
    return v ? { version: v[0] } : {};
  }
}

export default withRouter(CollectionDependencies);
