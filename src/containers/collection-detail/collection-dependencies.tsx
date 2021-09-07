import { t } from '@lingui/macro';
import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Link } from 'react-router-dom';

import { ImportAPI, ImportDetailType, ImportListType } from 'src/api';
import {
  CollectionHeader,
  LoadingPageWithHeader,
  ImportConsole,
  Main,
} from 'src/components';

import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from 'src/utilities/param-helper';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IState extends IBaseCollectionState {}

class CollectionDependencies extends React.Component<
  RouteComponentProps,
  IState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      collection: undefined,
      params: params,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    const { collection, params } = this.state;

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

    return (
      <React.Fragment>
        <CollectionHeader
          collection={collection}
          params={params}
          updateParams={
            (params) => {}
            //this.updateParams(params, () => this.loadData(true))
          }
          breadcrumbs={breadcrumbs}
          activeTab='dependencies'
          repo={this.context.selectedRepo}
        />
        <Main>
          <section className='body'>
            <div className='pf-c-content info-panel'>
              <h1>{t`Dependencies`}</h1>
              <p>{t`This collection is dependent on the following collections`}</p>
              ...List here...
              <p>{t`This collection is being used by `}</p>
              <table className='content-table pf-c-table pf-m-compact'>
                <tbody>
                  <tr>
                    <td>
                      <Link
                        to={formatPath(
                          Paths.collectionContentDocsByRepo,
                          {
                            /*collection: collection,
                                        namespace: namespace,
                                        type: content.content_type,
                                        name: content.name,
                                        repo: this.context.selectedRepo,
                                        */
                          },
                          //ParamHelper.getReduced(params, this.ignoredParams),
                        )}
                      >
                        Depended
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private loadData() {
    this.loadCollection(this.context.selectedRepo, false, () => {
      console.log('called after');
    });
  }

  get loadCollection() {
    return loadCollection;
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionDependencies);

CollectionDependencies.contextType = AppContext;
