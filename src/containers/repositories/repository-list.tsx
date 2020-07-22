import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  BaseHeader,
  CompoundFilter,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  Tabs,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Modal,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { WarningTriangleIcon, WrenchIcon } from '@patternfly/react-icons';
import { ParamHelper } from '../../utilities';
import { RepositoryForm } from '../../components/repositories/repository-form';
import { RemoteRepositoryTable } from '../../components/repositories/remote-repository-table';
import { LocalRepositoryTable } from '../../components/repositories/local-repository-table';
import { Constants } from '../../constants';

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
  showRepoFormModal: boolean;
  repositoryFromId: string;
  repositoryType: string;
  repository: Repository;
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
      showRepoFormModal: false,
      repositoryFromId: 'new',
      repositoryType: 'typeCertified',
      repository: {
        name: '',
        url: '',
        token: '',
        ssoUrl: '',
        yaml: '',
        sync: false,
      },
    };
  }

  componentDidMount() {}

  render() {
    const {
      params,
      itemCount,
      loading,
      repository,
      repositoryType,
    } = this.state;
    //TODO get repo data

    const tabs = ['Local', 'Remote'];
    return (
      <React.Fragment>
        <Modal
          variant='small'
          title={
            this.state.repositoryFromId === 'new' ? 'Add repo' : 'Edit repo'
          }
          isOpen={this.state.showRepoFormModal}
          onClose={() => this.setState({ showRepoFormModal: false })}
          actions={[
            <Button
              key='confirm'
              variant='primary'
              isDisabled={
                !repository.name ||
                !repository.url ||
                !repository.token ||
                (repositoryType === 'typeCertified' && !repository.ssoUrl) ||
                (repositoryType === 'typeCommunity' && !repository.yaml)
              }
              onClick={() => console.log('TO BE SAVED')}
            >
              {this.state.repositoryFromId === 'new' ? 'Add' : 'Save'}
            </Button>,
            <Button
              key='cancel'
              variant='secondary'
              onClick={() => this.setState({ showRepoFormModal: false })}
            >
              Cancel
            </Button>,
          ]}
        >
          <RepositoryForm
            repositoryId={'new'}
            updateRepository={repository =>
              this.setState({ repository: repository })
            }
            updateType={type => this.setState({ repositoryType: type })}
            repository={this.state.repository}
          />
        </Modal>
        <BaseHeader title='Repo Management'>
          {DEPLOYMENT_MODE === Constants.STANDALONE_DEPLOYMENT_MODE ? (
            <div className='header-bottom'>
              <div className='tab-link-container'>
                <div className='tabs'>
                  <Tabs
                    tabs={tabs}
                    params={params}
                    updateParams={p => this.updateParams(p)}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </BaseHeader>
        <Main className='repository-list'>
          <Section className='body'>
            {this.renderContent(params, loading, itemCount)}
          </Section>
        </Main>
      </React.Fragment>
    );
  }

  private renderContent(params, loading, itemCount) {
    if (!!params.tab && params.tab.toLowerCase() === 'local') {
      return (
        <div>
          <div className='toolbar'>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    updateParams={p =>
                      this.updateParams(p, () => console.log(p))
                    }
                    params={params}
                    filterConfig={[
                      {
                        id: 'repository',
                        title: 'Repo',
                      },
                    ]}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <Button
                    variant='primary'
                    onClick={() =>
                      this.setState({
                        showRepoFormModal: true,
                        repositoryFromId: 'new',
                      })
                    }
                  >
                    Add repo
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
            </Toolbar>
            <Pagination
              params={params}
              updateParams={p => console.log(p)}
              count={itemCount}
              isTop
            />
          </div>
          {loading ? (
            <LoadingPageSpinner />
          ) : (
            <LocalRepositoryTable
              repositories={[
                {
                  name: 'Remote one',
                  count: 1,
                  url: 'www.this-is-gonna-be-one-long-url.com',
                },
              ]}
              updateParams={this.updateParams}
            />
          )}
          <div className='footer'>
            <Pagination
              params={params}
              updateParams={p => console.log(p)}
              count={itemCount}
            />
          </div>
        </div>
      );
    }
    if (!!params.tab && params.tab.toLowerCase() === 'remote') {
      return (
        <div>
          <div className='toolbar'>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    updateParams={p =>
                      this.updateParams(p, () => console.log(p))
                    }
                    params={params}
                    filterConfig={[
                      {
                        id: 'repository',
                        title: 'Repo',
                      },
                    ]}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <Button
                    variant='primary'
                    onClick={() =>
                      this.setState({
                        showRepoFormModal: true,
                        repositoryFromId: 'new',
                      })
                    }
                  >
                    Add repo
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
            </Toolbar>
            <Pagination
              params={params}
              updateParams={p => console.log(p)}
              count={itemCount}
              isTop
            />
          </div>
          {loading ? (
            <LoadingPageSpinner />
          ) : (
            <RemoteRepositoryTable
              repositories={[{ name: 'Remote one', count: 1 }]}
              updateParams={this.updateParams}
            />
          )}
          <div className='footer'>
            <Pagination
              params={params}
              updateParams={p => console.log(p)}
              count={itemCount}
            />
          </div>
        </div>
      );
    }
    if (DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE) {
      return (
        <div>
          <div className='toolbar'>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    updateParams={p =>
                      this.updateParams(p, () => console.log(p))
                    }
                    params={params}
                    filterConfig={[
                      {
                        id: 'repository',
                        title: 'Repo',
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </Toolbar>
            <Pagination
              params={params}
              updateParams={p => console.log(p)}
              count={itemCount}
              isTop
            />
          </div>
          {loading ? (
            <LoadingPageSpinner />
          ) : (
            <LocalRepositoryTable
              repositories={[
                {
                  name: 'Remote one',
                  count: 1,
                  url: 'www.this-is-gonna-be-one-long-url.com',
                },
              ]}
              updateParams={this.updateParams}
            />
          )}
          <div className='footer'>
            <Pagination
              params={params}
              updateParams={p => console.log(p)}
              count={itemCount}
            />
          </div>
        </div>
      );
    }
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }
}

export default withRouter(RepositoryList);
