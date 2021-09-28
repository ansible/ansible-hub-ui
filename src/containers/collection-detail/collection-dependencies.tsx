import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  CollectionAPI,
  CollectionDetailType,
  CollectionUsedByDependencies,
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

import { filterIsSet, ParamHelper } from 'src/utilities';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

import './collection-dependencies.scss';

interface IState {
  collection: CollectionDetailType;
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
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    params['sort'] = !params['sort'] ? '-collection' : 'collection';

    this.state = {
      collection: undefined,
      params: params,
      usedByDependencies: [],
      usedByDependenciesCount: 0,
      usedByDependenciesLoading: true,
      alerts: [],
    };
  }

  componentDidMount() {
    this.loadData();
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

    const noDependencies: boolean = !Object.keys(
      collection.latest_version.metadata.dependencies,
    ).length;

    return (
      <React.Fragment>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <CollectionHeader
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
                      repo={this.context.selectedRepo}
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
    this.loadCollection(forceReload, () => this.loadUsedByDependencies());
  }

  private loadUsedByDependencies() {
    this.setState({ usedByDependenciesLoading: true }, () => {
      CollectionAPI.getUsedDependenciesByCollection(
        this.state.collection.namespace.name,
        this.state.collection.name,
        ParamHelper.getReduced(this.state.params, ['version']),
      )
        .then(({ data }) => {
          this.setState({
            usedByDependencies: data.data,
            usedByDependenciesCount: data.meta.count,
            usedByDependenciesLoading: false,
          });
        })
        .catch((err) =>
          this.setState({
            usedByDependenciesLoading: false,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Error loading dependent collections.`,
                description: err?.message,
              },
            ],
          }),
        );
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
      .then((result) => this.setState({ collection: result }, callback))
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
}

export default withRouter(CollectionDependencies);

CollectionDependencies.contextType = AppContext;
