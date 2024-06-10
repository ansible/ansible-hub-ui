import { t } from '@lingui/macro';
import React from 'react';
import { ImportAPI, type ImportDetailType, type ImportListType } from 'src/api';
import {
  CollectionHeader,
  ImportConsole,
  LoadingPageWithHeader,
  Main,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, type RouteProps, withRouter } from 'src/utilities';
import { type IBaseCollectionState, loadCollection } from './base';

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
      actuallyCollection: null,
      apiError: undefined,
      collection: null,
      collections: [],
      collectionsCount: 0,
      content: null,
      loadingImports: true,
      params,
      selectedImport: undefined,
      selectedImportDetail: undefined,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    const {
      actuallyCollection,
      apiError,
      collection,
      collections,
      collectionsCount,
      content,
      loadingImports,
      params,
      selectedImport,
      selectedImportDetail,
    } = this.state;

    if (!collection) {
      return <LoadingPageWithHeader />;
    }

    const { collection_version, repository } = collection;

    const breadcrumbs = [
      { name: t`Namespaces`, url: formatPath(Paths.namespaces) },
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
          activeTab='import-log'
          actuallyCollection={actuallyCollection}
          breadcrumbs={breadcrumbs}
          collection={collection}
          collections={collections}
          collectionsCount={collectionsCount}
          content={content}
          params={params}
          reload={() => this.loadData(true)}
          updateParams={(params) =>
            this.updateParams(params, () => this.loadData(true))
          }
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
      stateParams: this.state.params,
    });
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionImportLog);

CollectionImportLog.contextType = AppContext;
