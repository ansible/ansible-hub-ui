import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  BaseHeader,
  LoadingPageSpinner,
  Main,
  Tabs,
  RemoteRepositoryTable,
  LocalRepositoryTable,
  RemoteForm,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import { ParamHelper, mapErrorMessages } from '../../utilities';
import { Constants } from '../../constants';
import {
  RemoteAPI,
  RemoteType,
  DistributionAPI,
  MyDistributionAPI,
  DistributionType,
} from '../../api';
import { AppContext } from '../../loaders/app-context';

export class Repository {
  name: string;
  url: string;
  token: string;
  ssoUrl: string;
  yaml: string;
  sync: boolean;
}

interface IState {
  params: {
    page?: number;
    page_size?: number;
    tab?: string;
  };
  itemCount: number;
  loading: boolean;
  showRemoteFormModal: boolean;
  errorMessages: Object;

  content: RemoteType[] | DistributionType[];
  remoteToEdit: RemoteType;
}

class RepositoryList extends React.Component<RouteComponentProps, IState> {
  nonQueryStringParams = ['repository'];

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['tab']) {
      params['tab'] = 'local';
    }

    if (
      !params['tab'] &&
      DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE
    ) {
      params['tab'] = 'local';
    }

    this.state = {
      itemCount: 1,
      params: params,
      loading: false,
      showRemoteFormModal: false,
      content: [],
      remoteToEdit: undefined,
      errorMessages: {},
    };
  }

  componentDidMount() {
    this.loadContent();
  }

  render() {
    const {
      params,
      itemCount,
      loading,
      content,
      remoteToEdit,
      showRemoteFormModal,
      errorMessages,
    } = this.state;

    const tabs = ['Local', 'Remote'];
    return (
      <React.Fragment>
        {remoteToEdit && showRemoteFormModal && (
          <RemoteForm
            remote={remoteToEdit}
            updateRemote={(r: RemoteType) => this.setState({ remoteToEdit: r })}
            saveRemote={() => {
              const { remoteToEdit } = this.state;

              try {
                const distro_path =
                  remoteToEdit.repositories[0].distributions[0].base_path;
                RemoteAPI.update(distro_path, remoteToEdit)
                  .then(r => {
                    this.setState(
                      {
                        errorMessages: {},
                        showRemoteFormModal: false,
                        remoteToEdit: undefined,
                      },
                      () => this.loadContent(),
                    );
                  })
                  .catch(err =>
                    this.setState({ errorMessages: mapErrorMessages(err) }),
                  );
              } catch {
                this.setState({
                  errorMessages: {
                    __nofield:
                      "Can't update remote without a distribution attached to it.",
                  },
                });
              }
            }}
            errorMessages={errorMessages}
            showModal={showRemoteFormModal}
            closeModal={() =>
              this.setState({ showRemoteFormModal: false, errorMessages: {} })
            }
          />
        )}
        <BaseHeader title='Repo Management'>
          {DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE ? (
            <div className='header-bottom'>
              <div className='tab-link-container'>
                <div className='tabs'>
                  <Tabs
                    tabs={tabs}
                    params={params}
                    updateParams={p => {
                      // empty the content before updating the params to prevent
                      // rendering from breaking when the wrong content is loaded
                      this.setState({ content: [] }, () =>
                        this.updateParams(p, () => this.loadContent()),
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </BaseHeader>
        <Main className='repository-list'>
          <Section className='body'>
            {this.renderContent(params, loading, itemCount, content)}
          </Section>
        </Main>
      </React.Fragment>
    );
  }

  private renderContent(params, loading, itemCount, content) {
    const { user } = this.context;
    // Dont show remotes on insights
    if (
      DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE ||
      (!!params.tab && params.tab.toLowerCase() === 'local')
    ) {
      return (
        <div>
          {loading ? (
            <LoadingPageSpinner />
          ) : (
            <LocalRepositoryTable
              repositories={content}
              updateParams={this.updateParams}
            />
          )}
        </div>
      );
    }
    if (!!params.tab && params.tab.toLowerCase() === 'remote') {
      return (
        <div>
          {loading ? (
            <LoadingPageSpinner />
          ) : (
            <RemoteRepositoryTable
              repositories={content}
              updateParams={this.updateParams}
              editRemote={(remote: RemoteType) => {
                this.setState({
                  remoteToEdit: remote,
                  showRemoteFormModal: true,
                });
              }}
              syncRemote={distro =>
                RemoteAPI.sync(distro).then(result => this.loadContent())
              }
              user={user}
            />
          )}
        </div>
      );
    }
  }

  private loadContent() {
    const { params } = this.state;
    this.setState({ loading: true }, () => {
      if (params['tab'] == 'remote') {
        RemoteAPI.list(
          ParamHelper.getReduced(params, this.nonQueryStringParams),
        ).then(result => {
          this.setState({
            loading: false,
            content: result.data.data,
            itemCount: result.data.meta.count,
          });
        });
      } else {
        let APIClass = DistributionAPI;

        if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
          APIClass = MyDistributionAPI;
        }

        APIClass.list().then(result => {
          this.setState({
            loading: false,
            content: result.data.data,
            itemCount: result.data.meta.count,
          });
        });
      }
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }
}

export default withRouter(RepositoryList);
RepositoryList.contextType = AppContext;
