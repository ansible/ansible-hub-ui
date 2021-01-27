import * as React from 'react';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import { GroupAPI } from '../../api';
import { filterIsSet, mapErrorMessages, ParamHelper } from '../../utilities';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  closeAlertMixin,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorised,
  GroupModal,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
} from '../../components';
import {
  Button,
  Modal,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { formatPath, Paths } from '../../paths';
import { AppContext } from '../../loaders/app-context';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  redirect?: string;
  loading: boolean;
  itemCount: number;
  alerts: AlertType[];
  groups: any[];
  createModalVisible: boolean;
  deleteModalVisible: boolean;
  editModalVisible: boolean;
  selectedGroup: any;
  groupError: any;
}

class GroupList extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      params: params,
      loading: true,
      itemCount: 0,
      alerts: [],
      groups: [],
      createModalVisible: false,
      deleteModalVisible: false,
      editModalVisible: false,
      selectedGroup: null,
      groupError: null,
    };
  }

  componentDidMount() {
    this.queryGroups();
  }

  render() {
    const {
      redirect,
      itemCount,
      params,
      loading,
      createModalVisible,
      deleteModalVisible,
      editModalVisible,
      alerts,
      groups,
    } = this.state;

    const { user } = this.context;
    const noData = groups.length === 0 && !filterIsSet(params, ['name']);

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={i => this.closeAlert(i)}
        ></AlertList>
        {createModalVisible ? this.renderCreateModal() : null}
        {deleteModalVisible ? this.renderDeleteModal() : null}
        {editModalVisible ? this.renderEditModal() : null}
        <BaseHeader title='Groups'></BaseHeader>
        {redirect ? (
          <EmptyStateUnauthorised />
        ) : noData ? (
          <EmptyStateNoData
            title={'No groups yet'}
            description={'Groups will appear once created'}
            button={
              <Button
                variant='primary'
                onClick={() => this.setState({ createModalVisible: true })}
              >
                Create
              </Button>
            }
          />
        ) : (
          <Main>
            <Section className='body'>
              <div className='toolbar'>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      <ToolbarItem>
                        <CompoundFilter
                          updateParams={p =>
                            this.updateParams(p, () => this.queryGroups())
                          }
                          params={params}
                          filterConfig={[
                            {
                              id: 'name',
                              title: 'Group',
                            },
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                    {!!user && user.model_permissions.add_group && (
                      <ToolbarGroup>
                        <ToolbarItem>
                          <Button
                            onClick={() =>
                              this.setState({ createModalVisible: true })
                            }
                          >
                            Create
                          </Button>
                        </ToolbarItem>
                      </ToolbarGroup>
                    )}
                  </ToolbarContent>
                </Toolbar>

                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryGroups())
                  }
                  count={itemCount}
                  isTop
                />
              </div>
              <div>
                <AppliedFilters
                  updateParams={p =>
                    this.updateParams(p, () => this.queryGroups())
                  }
                  params={params}
                  ignoredParams={['page_size', 'page', 'sort']}
                />
              </div>
              {loading ? <LoadingPageSpinner /> : this.renderTable(params)}
              <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
                <Pagination
                  params={params}
                  updateParams={p =>
                    this.updateParams(p, () => this.queryGroups())
                  }
                  count={itemCount}
                />
              </div>
            </Section>
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderCreateModal() {
    return (
      <GroupModal
        onCancel={() =>
          this.setState({ createModalVisible: false, groupError: null })
        }
        onSave={value => this.saveGroup(value)}
        clearErrors={() => this.setState({ groupError: null })}
        errorMessage={this.state.groupError}
      />
    );
  }

  private renderEditModal() {
    return (
      <GroupModal
        onCancel={() =>
          this.setState({ editModalVisible: false, groupError: null })
        }
        onSave={value => this.editGroup(value)}
        clearErrors={() => this.setState({ groupError: null })}
        group={this.state.selectedGroup}
        errorMessage={this.state.groupError}
      />
    );
  }

  private renderDeleteModal() {
    return (
      <Modal
        variant='small'
        onClose={() => this.setState({ deleteModalVisible: false })}
        isOpen={true}
        title={''}
        children={null}
        header={
          <span className='pf-c-content'>
            <h2>
              <ExclamationTriangleIcon
                size='sm'
                style={{ color: 'var(--pf-global--warning-color--100)' }}
              />{' '}
              Delete Group?
            </h2>{' '}
          </span>
        }
        actions={[
          <Button
            key='delete'
            variant='danger'
            onClick={() => this.selectedGroup(this.state.selectedGroup)}
          >
            Delete
          </Button>,
          <Button
            key='cancel'
            variant='link'
            onClick={() => this.setState({ deleteModalVisible: false })}
          >
            Cancel
          </Button>,
        ]}
      ></Modal>
    );
  }

  private saveGroup(value) {
    GroupAPI.create({ name: value })
      .then(result => {
        this.setState({
          redirect: formatPath(Paths.groupDetail, {
            group: result.data.id,
          }),
          createModalVisible: false,
        });
      })
      .catch(error => this.setState({ groupError: mapErrorMessages(error) }));
  }

  private editGroup(value) {
    GroupAPI.update(this.state.selectedGroup.id.toString(), {
      name: value,
      pulp_href: this.state.selectedGroup.pulp_href,
      id: this.state.selectedGroup.id,
    })
      .then(result => {
        this.setState({
          redirect: '/group/' + result.data.id,
          editModalVisible: false,
          selectedGroup: null,
        });
      })
      .catch(() =>
        this.setState({
          editModalVisible: false,
          selectedGroup: null,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: null,
              description: 'Error editing group.',
            },
          ],
        }),
      );
  }

  private renderTable(params) {
    const { groups } = this.state;
    if (groups.length === 0) {
      return <EmptyStateFilter />;
    }

    let sortTableOptions = {
      headers: [
        {
          title: 'Group',
          type: 'alpha',
          id: 'name',
        },
        {
          title: '',
          type: 'none',
          id: 'kebab',
        },
      ],
    };

    return (
      <table aria-label='Group list' className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={p => this.updateParams(p, () => this.queryGroups())}
        />
        <tbody>{groups.map((group, i) => this.renderTableRow(group, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(group: any, index: number) {
    const { user } = this.context;
    return (
      <tr aria-labelledby={group.name} key={index}>
        <td>
          <Link
            to={formatPath(Paths.groupDetail, {
              group: group.id,
            })}
          >
            {group.name}
          </Link>
        </td>
        <td>
          {!!user && user.model_permissions.delete_group && (
            <Button
              aria-label={'Delete'}
              key='delete'
              variant='danger'
              onClick={() =>
                this.setState({
                  selectedGroup: group,
                  deleteModalVisible: true,
                })
              }
            >
              Delete
            </Button>
          )}
        </td>
      </tr>
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private selectedGroup(group) {
    GroupAPI.delete(group.id)
      .then(() => {
        this.setState({
          loading: true,
          selectedGroup: null,
          deleteModalVisible: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'success',
              title: null,
              description: 'Successfully deleted group.',
            },
          ],
        });
        this.queryGroups();
      })
      .catch(() =>
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: null,
              description: 'Error deleting group.',
            },
          ],
        }),
      );
  }

  private queryGroups() {
    this.setState({ loading: true }, () =>
      GroupAPI.list(this.state.params).then(result =>
        this.setState({
          groups: result.data.data,
          itemCount: result.data.meta.count,
          loading: false,
        }),
      ),
    );
  }
}

export default withRouter(GroupList);
GroupList.contextType = AppContext;
