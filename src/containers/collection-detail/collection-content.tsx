import { t } from '@lingui/macro';
import * as React from 'react';
import {
  CollectionContentList,
  CollectionHeader,
  LoadingPageWithHeader,
  Main,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import { RouteProps, withRouter } from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
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
      collections: [],
      collectionsCount: 0,
      collection: null,
      content: null,
      params: params,
    };
  }

  componentDidMount() {
    this.loadCollections(false);
  }

  render() {
    const { collections, collectionsCount, collection, params, content } =
      this.state;

    if (collections.length <= 0) {
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
      { name: t`Content` },
    ];

    return (
      <React.Fragment>
        <CollectionHeader
          reload={() => this.loadCollections(true)}
          collections={collections}
          collectionsCount={collectionsCount}
          collection={collection}
          content={content}
          params={params}
          updateParams={(params) =>
            this.updateParams(params, () => this.loadCollections(true))
          }
          breadcrumbs={breadcrumbs}
          activeTab='contents'
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
        this.setState({ collections, collection, content, collectionsCount }),
      stateParams: this.state.params,
    });
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionContent);

CollectionContent.contextType = AppContext;
