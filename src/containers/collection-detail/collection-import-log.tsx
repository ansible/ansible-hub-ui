import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { ImportAPI, ImportDetailType, ImportListType } from '../../api';
import {
  CollectionHeader,
  LoadingPageWithHeader,
  ImportConsole,
  Main,
} from '../../components';

import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from '../../utilities/param-helper';
import { formatPath, Paths } from '../../paths';
import { AppContext } from '../../loaders/app-context';

interface IState extends IBaseCollectionState {
  loadingImports: boolean;
  selectedImportDetail: ImportDetailType;
  selectedImport: ImportListType;
  apiError: string;
}

class CollectionImportLog extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      collection: undefined,
      params: params,
      loadingImports: true,
      selectedImportDetail: undefined,
      selectedImport: undefined,
      apiError: undefined,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    const {
      collection,
      params,
      loadingImports,
      selectedImportDetail,
      selectedImport,
      apiError,
    } = this.state;
    const name =
      NAMESPACE_TERM.charAt(0).toUpperCase() + NAMESPACE_TERM.slice(1);

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      { url: Paths[NAMESPACE_TERM], name: name },
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
      { name: 'Import log' },
    ];

    return (
      <React.Fragment>
        <CollectionHeader
          collection={collection}
          params={params}
          setVersion={(version) =>
            this.updateParams({ ...params, version }, () => this.loadData(true))
          }
          breadcrumbs={breadcrumbs}
          activeTab='import-log'
          repo={this.context.selectedRepo}
        />
        <Main>
          <section className='body'>
            <ImportConsole
              loading={loadingImports}
              task={selectedImportDetail}
              followMessages={false}
              setFollowMessages={(_) => null}
              selectedImport={selectedImport}
              apiError={apiError}
              hideCollectionName={true}
            />
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private loadData(forceReload = false) {
    const failMsg = 'Could not load import log';
    this.setState({ loadingImports: true }, () => {
      this.loadCollection(this.context.selectedRepo, forceReload, () => {
        ImportAPI.list({
          namespace: this.state.collection.namespace.name,
          name: this.state.collection.name,
          version: this.state.collection.latest_version.version,
          sort: '-created',
        })
          .then((importListResult) => {
            const importObj = importListResult.data.data[0];
            ImportAPI.get(importObj.id)
              .then((importDetailResult) => {
                this.setState({
                  apiError: undefined,
                  loadingImports: false,
                  selectedImport: importObj,
                  selectedImportDetail: importDetailResult.data,
                });
              })
              .catch((err) => {
                this.setState({
                  apiError: failMsg,
                  loadingImports: false,
                });
              });
          })
          .catch((err) => {
            this.setState({
              apiError: failMsg,
              loadingImports: false,
            });
          });
      });
    });
  }

  get loadCollection() {
    return loadCollection;
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionImportLog);

CollectionImportLog.contextType = AppContext;
