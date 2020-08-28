import * as React from 'react';

import {
  withRouter,
  RouteComponentProps,
  Redirect,
  Link,
} from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';

import { GroupAPI } from '../../api';
import { ParamHelper } from '../../utilities';
import {
  AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  CreateGroupModal,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  StatefulDropdown,
} from '../../components';
import {
  Button,
  DropdownItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  FormGroup,
  Modal,
  Spinner,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { formatPath, Paths } from '../../paths';

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

    this.state = {
      params: params,
      loading: true,
      itemCount: 0,
      alerts: [],
      groups: [],
      createModalVisible: false,
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
    } = this.state;

    if (redirect) {
      return <Redirect to={redirect}></Redirect>;
    }

    return (
      <React.Fragment>
        {createModalVisible ? this.renderCreateModal() : null}
        <BaseHeader title='Groups'></BaseHeader>
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
                          {
                            id: 'description',
                            title: 'Description',
                          },
                        ]}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
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
      </React.Fragment>
    );
  }

  private renderCreateModal() {
    return (
      <CreateGroupModal
        onCancel={() => this.setState({ createModalVisible: false })}
        onSave={value => this.saveGroup(value)}
      />
    );
  }

  private saveGroup(value) {
    GroupAPI.create({ name: value }).then(result => {
      this.setState({
        redirect: '/group/' + result.data.id,
        createModalVisible: false,
      });
    });
  }

  private renderTable(params) {
    const { groups } = this.state;
    if (groups.length === 0) {
      return (
        <EmptyState className='empty' variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WarningTriangleIcon} />
          <Title headingLevel='h2' size='lg'>
            No matches
          </Title>
          <EmptyStateBody>
            Please try adjusting your search query.
          </EmptyStateBody>
        </EmptyState>
      );
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
          <StatefulDropdown
            items={[
              <DropdownItem
                key='edit'
                component={
                  <Link
                    to={formatPath(Paths.editUser, {
                      group: group.id,
                    })}
                  >
                    Edit
                  </Link>
                }
              />,
              <DropdownItem
                key='delete'
                onClick={() => this.deleteGroup(group)}
              >
                Delete
              </DropdownItem>,
            ]}
          ></StatefulDropdown>
        </td>
      </tr>
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private deleteGroup(group) {
    console.log('DELETE GROUP: ' + group.name);
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
