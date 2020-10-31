import * as React from 'react';

import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

import {
  CollectionHeader,
  CollectionContentList,
  LoadingPageWithHeader,
  Main,
} from '../../components';
import { loadCollection, IBaseCollectionState } from './base';
import { ParamHelper } from '../../utilities/param-helper';
import { formatPath, Paths } from '../../paths';
import { AppContext } from '../../loaders/app-context';
import { Constants } from '../../constants';

interface IProps extends RouteComponentProps {
  selectedRepo: string;
}

// renders list of contents in a collection
class CollectionContent extends React.Component<IProps, IBaseCollectionState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search);

    this.state = {
      collection: undefined,
      params: params,
      repo: props.match.params.repo,
    };
  }

  componentDidMount() {
    const { repo } = this.state;
    if (!!repo && !Constants.ALLOWEDREPOS.includes(repo)) {
      this.setState({ redirect: true });
    }
    this.loadCollection(this.context.selectedRepo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedRepo !== this.props.selectedRepo) {
      this.loadCollection(this.context.selectedRepo);
    }
    if (
      DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE &&
      !location.href.includes('repo')
    ) {
      location.href =
        location.origin +
        location.pathname.replace(
          '/ui/',
          '/ui/repo/' +
            Constants.REPOSITORYNAMES[this.context.selectedRepo] +
            '/',
        );
    }
  }

  render() {
    const { collection, params, redirect } = this.state;

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    if (redirect) {
      return <Redirect to={Paths.notFound} />;
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
        url: formatPath(Paths.collection, {
          namespace: collection.namespace.name,
          collection: collection.name,
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
