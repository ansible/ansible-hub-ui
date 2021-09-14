import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';

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
} from 'src/components';

import { ParamHelper } from 'src/utilities/param-helper';
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
}

class CollectionDependencies extends React.Component<
  RouteComponentProps,
  IState
> {
  private ignoredParams = ['page_size', 'page', 'sort', 'name'];
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    this.state = {
      collection: undefined,
      params: params,
      usedByDependencies: [],
      usedByDependenciesCount: 0,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    const { collection, params, usedByDependencies, usedByDependenciesCount } =
      this.state;

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

    return (
      <React.Fragment>
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
              <p>{t`This collection is dependent on the following collections`}</p>
              <CollectionDependenciesList
                collection={this.state.collection}
                repo={this.context.selectedRepo}
              />
              <p>{t`This collection is being used by `}</p>
              <CollectionUsedbyDependenciesList
                repo={this.context.selectedRepo}
                usedByDependencies={usedByDependencies}
                itemCount={usedByDependenciesCount}
                params={dependenciesParams}
                updateParams={(p) =>
                  this.updateParams(
                    this.combineParams(this.state.params, p),
                    () => this.loadUsedByDependencies(),
                  )
                }
              />
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
    CollectionAPI.getUsedDependenciesByCollection(
      this.state.collection.namespace.name,
      this.state.collection.name,
      ParamHelper.getReduced(this.state.params, ['version']),
    ).then(({ data }) => {
      this.setState({
        usedByDependencies: data.data,
        usedByDependenciesCount: data.meta.count,
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
}

export default withRouter(CollectionDependencies);

CollectionDependencies.contextType = AppContext;
