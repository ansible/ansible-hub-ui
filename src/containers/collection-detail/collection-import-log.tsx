import * as React from 'react';

import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

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
import { Constants } from '../../constants';

interface IState extends IBaseCollectionState {
  loadingImports: boolean;
  selectedImportDetail: ImportDetailType;
  selectedImport: ImportListType;
  apiError: string;
}

interface IProps extends RouteComponentProps {
  selectedRepo: string;
}

class CollectionImportLog extends React.Component<IProps, IState> {
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
      repo: props.match.params.repo,
    };
  }

  componentDidMount() {
    const { repo } = this.state;
    if (!!repo && !Constants.ALLOWEDREPOS.includes(repo)) {
      this.setState({ redirect: true });
    }
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedRepo !== this.props.selectedRepo) {
      this.loadData();
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
    const {
      collection,
      params,
      loadingImports,
      selectedImportDetail,
      selectedImport,
      apiError,
      redirect,
    } = this.state;

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
      { name: 'Import log' },
    ];

    return (
      <React.Fragment>
        <CollectionHeader
          collection={collection}
          params={params}
          updateParams={params =>
            this.updateParams(params, () => this.loadData(true))
          }
          breadcrumbs={breadcrumbs}
          activeTab='import-log'
          repo={this.context.selectedRepo}
        />
        <Main>
          <Section className='body'>
            <ImportConsole
              loading={loadingImports}
              task={selectedImportDetail}
              followMessages={false}
              setFollowMessages={_ => null}
              selectedImport={selectedImport}
              apiError={apiError}
              hideCollectionName={true}
            />
          </Section>
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
          .then(importListResult => {
            const importObj = importListResult.data.data[0];
            ImportAPI.get(importObj.id)
              .then(importDetailResult => {
                this.setState({
                  apiError: undefined,
                  loadingImports: false,
                  selectedImport: importObj,
                  selectedImportDetail: importDetailResult.data,
                });
              })
              .catch(err => {
                this.setState({
                  apiError: failMsg,
                  loadingImports: false,
                });
              });
          })
          .catch(err => {
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
