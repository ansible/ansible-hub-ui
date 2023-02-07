import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  CollectionHeader,
  CollectionInfo,
  LoadingPageWithHeader,
  Main,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper } from 'src/utilities/param-helper';
import { IBaseCollectionState, loadCollection } from './base';

// renders collection level information
class CollectionDetail extends React.Component<
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

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      { url: Paths.namespaces, name: 'Namespaces' },
      {
        url: formatPath(Paths.namespaceByRepo, {
          namespace: collection.namespace.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.namespace.name,
      },
      {
        name: collection.name,
      },
    ];

    const setVersion = (version) =>
      this.updateParams({ ...params, version }, () =>
        this.loadCollection(this.context.selectedRepo, true),
      );

    return (
      <React.Fragment>
        <CollectionHeader
          collection={collection}
          params={params}
          breadcrumbs={breadcrumbs}
          activeTab='details'
          repo={this.context.selectedRepo}
          setVersion={setVersion}
        />
        <Main>
          <section className='body'>
            <CollectionInfo
              {...collection}
              params={params}
              setVersion={setVersion}
            />
          </section>
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

export default withRouter(CollectionDetail);

CollectionDetail.contextType = AppContext;
