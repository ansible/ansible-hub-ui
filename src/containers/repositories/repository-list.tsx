import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  DistributionAPI,
  DistributionType,
  RemoteAPI,
  RemoteType,
} from 'src/api';
import {
  BaseHeader,
  LoadingPageSpinner,
  LocalRepositoryTable,
  Main,
  RemoteForm,
  RemoteRepositoryTable,
  Tabs,
} from 'src/components';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
import { ParamHelper, mapErrorMessages } from 'src/utilities';

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
  // Used to save a copy of the remote before it's edited. This can be used to determine
  // which fields were changed when a user hits save.
  unModifiedRemote: RemoteType;

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

    if (!params['tab']) {
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

                RemoteAPI.smartUpdate(
                  distro_path,
                  remoteToEdit,
                  this.unModifiedRemote,
                )
                  .then((r) => {
                    this.setState(
                      {
                        errorMessages: {},
                        showRemoteFormModal: false,
                        remoteToEdit: undefined,
                      },
                      () => this.loadContent(),
                    );
                  })
                  .catch((err) =>
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
          <div className='header-bottom'>
            <div className='tab-link-container'>
              <div className='tabs'>
                <Tabs
                  tabs={tabs}
                  params={params}
                  updateParams={(p) => {
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
        </BaseHeader>
        <Main className='repository-list'>
          <section className='body'>
            {this.renderContent(params, loading, itemCount, content)}
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private renderContent(params, loading, itemCount, content) {
    const { user } = this.context;
    if (!!params.tab && params.tab.toLowerCase() === 'local') {
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
              remotes={content}
              updateParams={this.updateParams}
              editRemote={this.selectRemoteToEdit}
              syncRemote={(distro) =>
                RemoteAPI.sync(distro).then((result) => this.loadContent())
              }
              user={user}
              refreshRemotes={this.refreshContent}
            />
          )}
        </div>
      );
    }
  }

  private selectRemoteToEdit = (remote: RemoteType) => {
    // save a copy of the remote to diff against
    this.unModifiedRemote = { ...remote };

    this.setState({
      // create a copy of the remote to pass to the edit form, so that the
      // list of remotes doesn't get updated by accident.
      remoteToEdit: { ...remote },
      showRemoteFormModal: true,
    });
  };

  private refreshContent = () => {
    this.loadContent(false);
  };

  private loadContent = (showLoading = true) => {
    const { params } = this.state;
    this.setState({ loading: showLoading }, () => {
      if (params['tab'] == 'remote') {
        RemoteAPI.list(
          ParamHelper.getReduced(params, this.nonQueryStringParams),
        ).then((result) => {
          this.setState({
            loading: false,
            content: result.data.data,
            itemCount: result.data.meta.count,
          });
        });
      } else {
        let APIClass = DistributionAPI;

        APIClass.list().then((result) => {
          this.setState({
            loading: false,
            content: result.data.data,
            itemCount: result.data.meta.count,
          });
        });
      }
    });
  };

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }
}

export default withRouter(RepositoryList);
RepositoryList.contextType = AppContext;
