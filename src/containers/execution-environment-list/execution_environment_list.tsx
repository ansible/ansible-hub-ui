import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './execution-environment.scss';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  Button,
  Checkbox,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  ExecutionEnvironmentAPI,
  ExecutionEnvironmentType,
  TaskAPI,
} from 'src/api';
import { filterIsSet, ParamHelper } from 'src/utilities';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Main,
  Pagination,
  PublishToControllerModal,
  SortTable,
  StatefulDropdown,
  Tooltip,
  closeAlertMixin,
  EmptyStateUnauthorized,
} from 'src/components';
import { formatPath, Paths } from '../../paths';
import { AppContext } from 'src/loaders/app-context';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { DeleteModal } from 'src/components/delete-modal/delete-modal';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  publishToController: { digest?: string; image: string; tag?: string };
  loading: boolean;
  items: ExecutionEnvironmentType[];
  itemCount: number;
  alerts: AlertType[];
  unauthorized: boolean;
  deleteModalVisible: boolean;
  selectedItem: ExecutionEnvironmentType;
  confirmDelete: boolean;
}

class ExecutionEnvironmentList extends React.Component<
  RouteComponentProps,
  IState
> {
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
      publishToController: null,
      items: [],
      loading: true,
      itemCount: 0,
      alerts: [],
      unauthorized: false,
      deleteModalVisible: false,
      selectedItem: null,
      confirmDelete: false,
    };
  }

  componentDidMount() {
    if (!this.context.user || this.context.user.is_anonymous) {
      this.setState({ unauthorized: true, loading: false });
    } else {
      this.queryEnvironments();
    }
  }

  render() {
    const {
      params,
      publishToController,
      itemCount,
      loading,
      alerts,
      items,
      unauthorized,
      deleteModalVisible,
      selectedItem,
      confirmDelete,
    } = this.state;
    const noData = items.length === 0 && !filterIsSet(params, ['name']);
    const pushImagesButton = (
      <Button
        variant='link'
        onClick={() =>
          window.open(
            'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.0-ea/html-single/managing_containers_in_private_automation_hub/index',
            '_blank',
          )
        }
      >
        Push container images <ExternalLinkAltIcon />
      </Button>
    );

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <PublishToControllerModal
          digest={publishToController?.digest}
          image={publishToController?.image}
          isOpen={!!publishToController}
          onClose={() => this.setState({ publishToController: null })}
          tag={publishToController?.tag}
        />
        <BaseHeader title={t`Execution Environments`}></BaseHeader>
        {deleteModalVisible && (
    <DeleteModal
        title={'Permanently delete container'}
        cancelAction={() =>
            this.setState({ deleteModalVisible: false, selectedItem: null })
        }
        deleteAction={() => this.deleteContainer()}
        isDisabled={!confirmDelete}
    >
      <Trans>
        Deleting <b>{selectedItem.name}</b> and its data will be lost.
      </Trans>
      <Checkbox
          isChecked={confirmDelete}
          onChange={(value) => this.setState({ confirmDelete: value })}
          label={t`I understand that this action cannot be undone.`}
          id='delete_confirm'
      />
    </DeleteModal>
)}
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : noData && !loading ? (
          <EmptyStateNoData
            title={t`No container repositories yet`}
            description={t`You currently have no container repositories. Add a container repository via the CLI to get started.`}
            button={pushImagesButton}
          />
        ) : (
          <Main>
            {loading ? (
              <LoadingPageSpinner />
            ) : (
              <section className='body'>
                <div className='container-list-toolbar'>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <CompoundFilter
                            updateParams={(p) => {
                              p['page'] = 1;
                              this.updateParams(p, () =>
                                this.queryEnvironments(),
                              );
                            }}
                            params={params}
                            filterConfig={[
                              {
                                id: 'name',
                                title: t`Container repository name`,
                              },
                            ]}
                          />
                        </ToolbarItem>
                        <ToolbarItem>{pushImagesButton}</ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarContent>
                  </Toolbar>

                  <Pagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryEnvironments())
                    }
                    count={itemCount}
                    isTop
                  />
                </div>
                <div>
                  <AppliedFilters
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryEnvironments())
                    }
                    params={params}
                    ignoredParams={['page_size', 'page', 'sort']}
                  />
                </div>
                {this.renderTable(params)}
                <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
                  <Pagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryEnvironments())
                    }
                    count={itemCount}
                  />
                </div>
              </section>
            )}
          </Main>
        )}
      </React.Fragment>
    );
  }

  private renderTable(params) {
    const { items } = this.state;
    if (items.length === 0) {
      return <EmptyStateFilter />;
    }

    let sortTableOptions = {
      headers: [
        {
          title: t`Container repository name`,
          type: 'alpha',
          id: 'name',
        },
        {
          title: t`Description`,
          type: 'alpha',
          id: 'description',
        },
        {
          title: t`Created`,
          type: 'numeric',
          id: 'created',
        },
        {
          title: t`Last modified`,
          type: 'alpha',
          id: 'updated',
        },
        {
          title: '',
          type: 'none',
          id: 'controls',
        },
      ],
    };

    return (
      <table aria-label={t`User list`} className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) =>
            this.updateParams(p, () => this.queryEnvironments())
          }
        />
        <tbody>{items.map((user, i) => this.renderTableRow(user, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(item: any, index: number) {
    const description = item.description;
    const dropdownItems = [
      <DropdownItem
        key='publish-to-controller'
        onClick={() => {
          this.setState({
            publishToController: {
              image: item.name,
            },
          });
        }}
      >
        {t`Use in Controller`}
      </DropdownItem>,
      <DropdownItem
        key='delete'
        onClick={() =>
          this.setState({ selectedItem: item, deleteModalVisible: true })
        }
      >
        {t`Delete`}
      </DropdownItem>,
    ].filter((truthy) => truthy);

    return (
      <tr aria-labelledby={item.name} key={index}>
        <td>
          <Link
            to={formatPath(Paths.executionEnvironmentDetail, {
              container: item.pulp.distribution.base_path,
            })}
          >
            {item.name}
          </Link>
        </td>
        {description ? (
          <td className={'pf-m-truncate'}>
            <Tooltip content={description}>{description}</Tooltip>
          </td>
        ) : (
          <td></td>
        )}
        <td>
          <DateComponent date={item.created} />
        </td>
        <td>
          <DateComponent date={item.updated} />
        </td>
        <td style={{ paddingRight: '0px', textAlign: 'right' }}>
          {!!dropdownItems.length && <StatefulDropdown items={dropdownItems} />}
        </td>
      </tr>
    );
  }

  private queryEnvironments() {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.list(this.state.params).then((result) =>
        this.setState({
          items: result.data.data,
          itemCount: result.data.meta.count,
          loading: false,
        }),
      ),
    );
  }

  private deleteContainer() {
    const { selectedItem } = this.state;
    ExecutionEnvironmentAPI.deleteExecutionEnvironment(selectedItem.name)
      .then((result) => {
        let taskId = result.data.task.split('tasks/')[1].replace('/', '');
        this.setState({
          loading: true,
          deleteModalVisible: false,
          selectedItem: null,
          confirmDelete: false,
        });
        this.waitForTask(taskId).then(() => {
          this.setState({
            alerts: this.state.alerts.concat([
              {
                variant: 'success',
                title: t`Success: ${selectedItem.name} was deleted`,
              },
            ]),
          });
          this.queryEnvironments();
        });
      })
      .catch(() => {
        this.setState({
          deleteModalVisible: false,
          selectedItem: null,
          confirmDelete: false,
          alerts: this.state.alerts.concat([
            { variant: 'danger', title: t`Error: delete failed` },
          ]),
        });
      });
  }

  private waitForTask(task) {
    return TaskAPI.get(task).then((result) => {
      if (result.data.state !== 'completed') {
        return new Promise((r) => setTimeout(r, 500)).then(() =>
          this.waitForTask(task),
        );
      }
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(ExecutionEnvironmentList);
ExecutionEnvironmentList.contextType = AppContext;
