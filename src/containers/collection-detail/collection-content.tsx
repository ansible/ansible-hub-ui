import { t } from '@lingui/macro';
import * as React from 'react';

import { RouteProps, withRouter } from 'src/utilities';

import {
  CollectionHeader,
  CollectionContentList,
  LoadingPageWithHeader,
  Main,
} from 'src/components';
import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from 'src/utilities/param-helper';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

// renders list of contents in a collection
class CollectionContent extends React.Component<
  RouteProps,
  IBaseCollectionState
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
    this.loadCollection(false);
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
      { name: t`Content` },
    ];

    return (
      <React.Fragment>
        <CollectionHeader
          reload={() => this.loadCollection(true)}
          collection={collection}
          params={params}
          updateParams={(params) =>
            this.updateParams(params, () => this.loadCollection(true))
          }
          breadcrumbs={breadcrumbs}
          activeTab='contents'
          repo={this.context.selectedRepo}
        />
        <Main>
          <section className='body'>
            <CollectionContentList
              contents={collection.latest_version.metadata.contents}
              collection={collection.name}
              namespace={collection.namespace.name}
              params={params}
              updateParams={(p) => this.updateParams(p)}
            ></CollectionContentList>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private loadCollection(forceReload) {
    loadCollection({
      forceReload,
      matchParams: this.props.routeParams,
      navigate: this.props.navigate,
      selectedRepo: this.context.selectedRepo,
      setCollection: (collection) => this.setState({ collection }),
      stateParams: this.state.params,
    });
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionContent);

CollectionContent.contextType = AppContext;
