import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

import {
  CollectionHeader,
  CollectionInfo,
  LoadingPageWithHeader,
  Main,
} from '../../components';
import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from '../../utilities/param-helper';
import { formatPath, Paths } from '../../paths';

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
    this.loadCollection();
  }

  render() {
    const { collection, params } = this.state;

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const breadcrumbs = [
      { url: Paths.partners, name: 'Partners' },
      {
        url: formatPath(Paths.namespace, {
          namespace: collection.namespace.name,
        }),
        name: collection.namespace.name,
      },
      {
        name: collection.name,
      },
    ];

    return (
      <React.Fragment>
        <CollectionHeader
          collection={collection}
          params={params}
          updateParams={p =>
            this.updateParams(p, () => this.loadCollection(true))
          }
          breadcrumbs={breadcrumbs}
          activeTab='details'
        />
        <Main>
          <Section className='body'>
            <CollectionInfo
              {...collection}
              updateParams={p => this.updateParams(p)}
              params={this.state.params}
            />
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

export default withRouter(CollectionDetail);
