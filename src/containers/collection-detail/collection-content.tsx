import { t } from '@lingui/macro';
import * as React from 'react';
import {
  CollectionContentList,
  CollectionHeader,
  LoadingPageWithHeader,
  Main,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, RouteProps, withRouter } from 'src/utilities';
import { IBaseCollectionState, loadCollection } from './base';

// renders list of contents in a collection
class CollectionContent extends React.Component<
  RouteProps,
  IBaseCollectionState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      collection: null,
      collections: [],
      collectionsCount: 0,
      content: null,
      params,
    };
  }

  componentDidMount() {
    this.loadCollections(false);
  }

  render() {
    const { collection, collections, collectionsCount, content, params } =
      this.state;

    if (collections.length <= 0) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
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
      { name: t`Content` },
    ];

    return (
      <React.Fragment>
        <CollectionHeader
          activeTab='contents'
          breadcrumbs={breadcrumbs}
          collection={collection}
          collections={collections}
          collectionsCount={collectionsCount}
          content={content}
          params={params}
          reload={() => this.loadCollections(true)}
          updateParams={(params) =>
            this.updateParams(params, () => this.loadCollections(true))
          }
        />
        <Main>
          <section className='body'>
            <CollectionContentList
              contents={content.contents}
              collection={collection}
              params={params}
              updateParams={(p) => this.updateParams(p)}
            ></CollectionContentList>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private loadCollections(forceReload) {
    loadCollection({
      forceReload,
      matchParams: this.props.routeParams,
      navigate: this.props.navigate,
      setCollection: (collections, collection, content, collectionsCount) =>
        this.setState({
          collections,
          collection,
          content,
          collectionsCount,
        }),
      stateParams: this.state.params,
    });
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionContent);

CollectionContent.contextType = AppContext;
