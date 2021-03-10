import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

import {
  CollectionHeader,
  CollectionContentList,
  LoadingPageWithHeader,
  Main,
} from 'src/components';
import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from 'src/utilities/param-helper';
import { formatPath, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

// renders list of contents in a collection
class CollectionContent extends React.Component<
  RouteComponentProps,
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
    this.loadCollection(this.context.selectedRepo);
  }

  render() {
    const { collection, params } = this.state;
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
      { name: 'Content' },
    ];

    return (
      <React.Fragment>
        <CollectionHeader
          collection={collection}
          params={params}
          updateParams={params =>
            this.updateParams(params, () =>
              this.loadCollection(this.context.selectedRepo, true),
            )
          }
          breadcrumbs={breadcrumbs}
          activeTab='contents'
          repo={this.context.selectedRepo}
        />
        <Main>
          <Section className='body'>
            <CollectionContentList
              contents={collection.latest_version.contents}
              collection={collection.name}
              namespace={collection.namespace.name}
              params={params}
              updateParams={p => this.updateParams(p)}
            ></CollectionContentList>
          </Section>
        </Main>
      </React.Fragment>
    );
  }

  get loadCollection() {
    return loadCollection;
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(CollectionContent);

CollectionContent.contextType = AppContext;
