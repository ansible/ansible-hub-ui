import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './execution-environment.scss';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  Button,
  Checkbox,
  DropdownItem,
  Label,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  ExecutionEnvironmentAPI,
  ExecutionEnvironmentRemoteAPI,
  ExecutionEnvironmentType,
} from 'src/api';
import {
  filterIsSet,
  parsePulpIDFromURL,
  waitForTask,
  ParamHelper,
} from 'src/utilities';
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
  RepositoryForm,
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
  alerts: AlertType[];
  itemCount: number;
  itemToEdit?: ExecutionEnvironmentType;
  items: ExecutionEnvironmentType[];
  loading: boolean;
  params: {
    page?: number;
    page_size?: number;
  };
  publishToController: { digest?: string; image: string; tag?: string };
  showRemoteModal: boolean;
  unauthorized: boolean;
  deleteModalVisible: boolean;
  selectedItem: ExecutionEnvironmentType;
  confirmDelete: boolean;
  isDeletionPending: boolean;
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
      alerts: [],
      itemCount: 0,
      itemToEdit: null,
      items: [],
      loading: true,
      params,
      publishToController: null,
      showRemoteModal: false,
      unauthorized: false,
      deleteModalVisible: false,
      selectedItem: null,
      confirmDelete: false,
      isDeletionPending: false,
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
      alerts,
      itemCount,
      itemToEdit,
      items,
      loading,
      params,
      publishToController,
      showRemoteModal,
      unauthorized,
      deleteModalVisible,
      selectedItem,
      confirmDelete,
      isDeletionPending,
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
        <Trans>Push container images</Trans> <ExternalLinkAltIcon />
      </Button>
    );
    const addRemoteButton = (
      <Button
        onClick={() =>
          this.setState({
            showRemoteModal: true,
            itemToEdit: {} as ExecutionEnvironmentType,
          })
        }
        variant='primary'
      >
        <Trans>Add execution environment</Trans>
      </Button>
    );

    const name = !!selectedItem ? selectedItem.name : '';

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
        {showRemoteModal && this.renderRemoteModal(itemToEdit)}
        <BaseHeader title={t`Execution Environments`}></BaseHeader>
        {deleteModalVisible && (
          <DeleteModal
            spinner={isDeletionPending}
            title={'Permanently delete container'}
            cancelAction={() =>
              this.setState({ deleteModalVisible: false, selectedItem: null })
            }
            deleteAction={() => this.deleteContainer()}
            isDisabled={!confirmDelete || isDeletionPending}
          >
            <Trans>
              Deleting <b>{name}</b> and its data will be lost.
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
            button={
              <>
                {addRemoteButton}
                {pushImagesButton}
              </>
            }
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
                        <ToolbarItem>{addRemoteButton}</ToolbarItem>
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
          title: t`Container registry type`,
          type: 'none',
          id: 'type',
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
        key='edit'
        onClick={() =>
          this.setState({
            showRemoteModal: true,
            itemToEdit: { ...item },
          })
        }
      >
        {t`Edit`}
      </DropdownItem>,
      item.pulp.repository.remote && (
        <DropdownItem key='sync' onClick={() => this.sync(item.name)}>
          {t`Sync from registry`}
        </DropdownItem>
      ),
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
      this.context.user.model_permissions.delete_containerrepository && (
        <DropdownItem
          key='delete'
          onClick={() =>
            this.setState({ selectedItem: item, deleteModalVisible: true })
          }
        >
          {t`Delete`}
        </DropdownItem>
      ),
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
        <td>
          <Label>{item.pulp.repository.remote ? t`Remote` : t`Local`}</Label>
        </td>
        <td style={{ paddingRight: '0px', textAlign: 'right' }}>
          {!!dropdownItems.length && (
            <div data-cy='kebab-toggle'>
              <StatefulDropdown items={dropdownItems} />
            </div>
          )}
        </td>
      </tr>
    );
  }

  private renderRemoteModal(itemToEdit) {
    const { name, namespace, description, pulp } = itemToEdit;
    const { pulp_id, registry, upstream_name, include_tags, exclude_tags } =
      pulp?.repository?.remote || {};
    const remote = pulp?.repository ? !!pulp?.repository?.remote : true; // add only supports remote
    const isNew = !pulp?.repository; // only exists in real data
    const distributionPulpId = pulp?.distribution?.pulp_id;

    return (
      <RepositoryForm
        isRemote={!!remote}
        isNew={isNew}
        name={name}
        namespace={namespace?.name}
        description={description}
        upstreamName={upstream_name}
        registry={registry}
        excludeTags={exclude_tags || []}
        includeTags={include_tags || []}
        permissions={namespace?.my_permissions || []}
        remotePulpId={pulp_id}
        distributionPulpId={distributionPulpId}
        onSave={(promise) => {
          promise
            .then(() => {
              this.setState(
                {
                  showRemoteModal: false,
                  itemToEdit: null,
                },
                () => this.queryEnvironments(),
              );
            })
            .catch(() => {
              this.setState({
                alerts: this.state.alerts.concat({
                  variant: 'danger',
                  title: t`Error: changes weren't saved`,
                }),
              });
            });
        }}
        onCancel={() =>
          this.setState({
            showRemoteModal: false,
            itemToEdit: null,
          })
        }
      />
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
    const { name } = selectedItem;
    this.setState({ isDeletionPending: true }, () =>
      ExecutionEnvironmentAPI.deleteExecutionEnvironment(selectedItem.name)
        .then((result) => {
          const taskId = result.data.task.split('tasks/')[1].replace('/', '');
          waitForTask(taskId).then(() => {
            this.setState({
              confirmDelete: false,
              deleteModalVisible: false,
              isDeletionPending: false,
              selectedItem: null,
              alerts: this.state.alerts.concat([
                {
                  variant: 'success',
                  title: t`Success: ${name} was deleted`,
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
            isDeletionPending: false,
            alerts: this.state.alerts.concat([
              { variant: 'danger', title: t`Error: delete failed` },
            ]),
          });
        }),
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private addAlert(title, variant, description?) {
    this.setState({
      alerts: [
        ...this.state.alerts,
        {
          description,
          title,
          variant,
        },
      ],
    });
  }

  private sync(name) {
    ExecutionEnvironmentRemoteAPI.sync(name)
      .then((result) => {
        const task_id = parsePulpIDFromURL(result.data.task);
        this.addAlert(
          t`Sync initiated for ${name}`,
          'success',
          <span>
            <Trans>
              View the task{' '}
              <Link to={formatPath(Paths.taskDetail, { task: task_id })}>
                here
              </Link>
              .
            </Trans>
          </span>,
        );
      })
      .catch(() => this.addAlert(t`Sync failed for ${name}`, 'danger'));
  }
}

export default withRouter(ExecutionEnvironmentList);
ExecutionEnvironmentList.contextType = AppContext;
