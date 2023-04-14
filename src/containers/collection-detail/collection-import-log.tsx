import { t } from '@lingui/macro';
import * as React from 'react';
import { ImportAPI, ImportDetailType, ImportListType } from 'src/api';
import {
  CollectionHeader,
  ImportConsole,
  LoadingPageWithHeader,
  Main,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import { RouteProps, withRouter } from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
import { IBaseCollectionState, loadCollection } from './base';

interface IState extends IBaseCollectionState {
  loadingImports: boolean;
  selectedImportDetail: ImportDetailType;
  selectedImport: ImportListType;
  apiError: string;
}

class CollectionImportLog extends React.Component<RouteProps, IState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      collection: null,
      collections: [],
      collectionsCount: 0,
      content: null,
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
      collections,
      collectionsCount,
      params,
      loadingImports,
      selectedImportDetail,
      selectedImport,
      apiError,
      content,
    } = this.state;

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const { collection_version, repository } = collection;

    const breadcrumbs = [
      namespaceBreadcrumb,
      {
        url: formatPath(Paths.namespaceDetail, {
          namespace: collection_version.namespace,
        }),
        name: collection_version.namespace,
      },
      {
        url: formatPath(Paths.collectionByRepo, {
          namespace: collection_version.namespace,
          collection: collection_version.name,
          repo: repository.name,
        }),
        name: collection_version.name,
      },
      { name: t`Import log` },
    ];

    return (
      <React.Fragment>
        <CollectionHeader
          reload={() => this.loadData(true)}
          collections={collections}
          collectionsCount={collectionsCount}
          collection={collection}
          content={content}
          params={params}
          updateParams={(params) =>
            this.updateParams(params, () => this.loadData(true))
          }
          breadcrumbs={breadcrumbs}
          activeTab='import-log'
        />
        <Main>
          <section className='body'>
            <ImportConsole
              empty={false}
              loading={loadingImports}
              task={selectedImportDetail}
              followMessages={false}
              setFollowMessages={() => null}
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
    const failMsg = t`Could not load import log`;
    this.setState({ loadingImports: true }, () => {
      this.loadCollection(forceReload, () => {
        ImportAPI.list({
          namespace: this.state.collection.collection_version.namespace,
          name: this.state.collection.collection_version.name,
          version: this.state.collection.collection_version.version,
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
              .catch(() => {
                this.setState({
                  apiError: failMsg,
                  loadingImports: false,
                });
              });
          })
          .catch(() => {
            this.setState({
              apiError: failMsg,
              loadingImports: false,
            });
          });
      });
    });
  }

  private loadCollection(forceReload, callback) {
    loadCollection({
      forceReload,
      matchParams: this.props.routeParams,
      navigate: this.props.navigate,
      setCollection: (collections, collection, content, collectionsCount) =>
        this.setState(
          { collections, collection, content, collectionsCount },
          callback,
        ),
      stateParams: this.state.params,
    });
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionImportLog);

CollectionImportLog.contextType = AppContext;
