import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import './registry-list.scss';

import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { ExecutionEnvironmentRegistryAPI, RemoteType } from 'src/api';
import {
  ParamHelper,
  filterIsSet,
  lastSyncStatus,
  lastSynced,
  mapErrorMessages,
  parsePulpIDFromURL,
} from 'src/utilities';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  DateComponent,
  DeleteModal,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Main,
  Pagination,
  RemoteForm,
  SortTable,
  StatefulDropdown,
  closeAlertMixin,
  EmptyStateUnauthorized,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';

import { Paths, formatPath } from 'src/paths';

interface IState {
  alerts: AlertType[];
  itemCount: number;
  items: RemoteType[];
  loading: boolean;
  params: {
    page?: number;
    page_size?: number;
  };
  remoteFormErrors: Object;
  remoteFormNew: boolean;
  remoteToEdit?: RemoteType;
  remoteUnmodified?: RemoteType;
  showDeleteModal: boolean;
  showRemoteFormModal: boolean;
  inputText: string;
}

class ExecutionEnvironmentRegistryList extends React.Component<
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
      items: [],
      loading: true,
      params,
      remoteFormErrors: {},
      remoteFormNew: false,
      remoteToEdit: null,
      remoteUnmodified: null,
      showDeleteModal: false,
      showRemoteFormModal: false,
      inputText: '',
    };
  }

  componentDidMount() {
    this.queryRegistries();
  }

  render() {
    const {
      alerts,
      itemCount,
      items,
      loading,
      params,
      remoteFormErrors,
      remoteFormNew,
      remoteToEdit,
      remoteUnmodified,
      showDeleteModal,
      showRemoteFormModal,
    } = this.state;
    const noData =
      items.length === 0 && !filterIsSet(params, ['name__icontains']);

    if (this.context.user.is_anonymous) {
      return <EmptyStateUnauthorized />;
    }

    const addButton = this.context.user.model_permissions
      .add_containerregistry ? (
      <Button
        onClick={() =>
          this.setState({
            remoteFormErrors: {},
            remoteFormNew: true,
            remoteToEdit: {
              name: '',
              // API defaults to true when not sending anything, make the UI fit
              tls_validation: true,
              write_only_fields: [
                { name: 'username', is_set: false },
                { name: 'password', is_set: false },
                { name: 'proxy_username', is_set: false },
                { name: 'proxy_password', is_set: false },
                { name: 'client_key', is_set: false },
              ],
            } as RemoteType,
            remoteUnmodified: null,
            showRemoteFormModal: true,
          })
        }
      >
        <Trans>Add remote registry</Trans>
      </Button>
    ) : null;

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        {showRemoteFormModal && (
          <RemoteForm
            remote={remoteToEdit}
            remoteType='registry'
            updateRemote={(r: RemoteType) => this.setState({ remoteToEdit: r })}
            saveRemote={() => {
              const { remoteFormNew, remoteToEdit } = this.state;
              let newRemote = { ...remoteToEdit };

              if (remoteFormNew) {
                // prevent "This field may not be blank." when writing in and then deleting username/password/etc
                // only when creating, edit diffs with remoteUnmodified
                Object.keys(newRemote).forEach((k) => {
                  if (newRemote[k] === '' || newRemote[k] == null) {
                    delete newRemote[k];
                  }
                });
              }

              let promise = remoteFormNew
                ? ExecutionEnvironmentRegistryAPI.create(newRemote)
                : ExecutionEnvironmentRegistryAPI.smartUpdate(
                    remoteToEdit.pk,
                    remoteToEdit,
                    remoteUnmodified,
                  );

              promise
                .then(() => {
                  this.setState(
                    {
                      remoteToEdit: null,
                      remoteUnmodified: null,
                      showRemoteFormModal: false,
                    },
                    () => this.queryRegistries(),
                  );
                })
                .catch((err) =>
                  this.setState({ remoteFormErrors: mapErrorMessages(err) }),
                );
            }}
            errorMessages={remoteFormErrors}
            showModal={showRemoteFormModal}
            closeModal={() =>
              this.setState({
                remoteToEdit: null,
                remoteUnmodified: null,
                showRemoteFormModal: false,
              })
            }
            allowEditName={remoteFormNew}
            title={
              remoteFormNew ? t`Add remote registry` : t`Edit remote registry`
            }
          />
        )}
        {showDeleteModal && remoteToEdit && (
          <DeleteModal
            cancelAction={() =>
              this.setState({ showDeleteModal: false, remoteToEdit: null })
            }
            deleteAction={() => this.deleteRegistry(remoteToEdit)}
            title={t`Delete remote registry?`}
            children={
              <Trans>
                <b>{remoteToEdit.name}</b> will be deleted.
              </Trans>
            }
          />
        )}
        <BaseHeader title={t`Remote Registries`}></BaseHeader>
        {noData && !loading ? (
          <EmptyStateNoData
            title={t`No remote registries yet`}
            description={t`You currently have no remote registries.`}
            button={addButton}
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
                            inputText={this.state.inputText}
                            onChange={(text) =>
                              this.setState({ inputText: text })
                            }
                            updateParams={(p) => {
                              p['page'] = 1;
                              this.updateParams(p, () =>
                                this.queryRegistries(),
                              );
                            }}
                            params={params}
                            filterConfig={[
                              {
                                id: 'name__icontains',
                                title: t`Name`,
                              },
                            ]}
                          />
                        </ToolbarItem>
                        <ToolbarItem>{addButton}</ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarContent>
                  </Toolbar>

                  <Pagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.queryRegistries())
                    }
                    count={itemCount}
                    isTop
                  />
                </div>
                <div>
                  <AppliedFilters
                    updateParams={(p) => {
                      this.updateParams(p, () => this.queryRegistries());
                      this.setState({ inputText: '' });
                    }}
                    params={params}
                    ignoredParams={['page_size', 'page', 'sort']}
                    niceNames={{
                      name__icontains: t`Name`,
                    }}
                  />
                </div>
                {this.renderTable(params)}
                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.queryRegistries())
                  }
                  count={itemCount}
                />
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
          title: t`Name`,
          type: 'alpha',
          id: 'name',
        },
        {
          title: t`Created`,
          type: 'alpha',
          id: 'created_at',
        },
        {
          title: t`Last updated`,
          type: 'alpha',
          id: 'updated_at',
        },
        {
          title: t`Registry URL`,
          type: 'alpha',
          id: 'url',
        },
        {
          title: t`Registry sync status`,
          type: 'none',
          id: 'last_sync_task',
        },
        {
          title: '',
          type: 'none',
          id: 'controls',
        },
      ],
    };

    return (
      <table className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) =>
            this.updateParams(p, () => this.queryRegistries())
          }
        />
        <tbody>{items.map((user, i) => this.renderTableRow(user, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(item: any, index: number) {
    const dropdownItems = [
      this.context.user.model_permissions.change_containerregistry && (
        <DropdownItem
          key='edit'
          onClick={() =>
            this.setState({
              remoteFormErrors: {},
              remoteFormNew: false,
              remoteToEdit: { ...item },
              remoteUnmodified: { ...item },
              showRemoteFormModal: true,
            })
          }
        >
          <Trans>Edit</Trans>
        </DropdownItem>
      ),
      this.context.user.model_permissions.delete_containerregistry && (
        <DropdownItem
          key='delete'
          onClick={() =>
            this.setState({
              showDeleteModal: true,
              remoteToEdit: item,
            })
          }
        >
          <Trans>Delete</Trans>
        </DropdownItem>
      ),
      <Tooltip
        content={
          item.is_indexable
            ? t`Find execution environments in this registry`
            : t`Indexing execution environments is only supported on registry.redhat.io`
        }
      >
        <DropdownItem
          key='index'
          onClick={() => this.indexRegistry(item)}
          isDisabled={!item.is_indexable}
        >
          <Trans>Index execution environments</Trans>
        </DropdownItem>
      </Tooltip>,
    ].filter(Boolean);
    return (
      <tr aria-labelledby={item.name} key={index}>
        <td>{item.name}</td>
        <td>
          <DateComponent date={item.created_at} />
        </td>
        <td>
          <DateComponent date={item.updated_at} />
        </td>
        <td>{item.url}</td>
        <td>
          {lastSyncStatus(item) || '---'}
          {lastSynced(item)}
        </td>

        <td style={{ paddingRight: '0px', textAlign: 'right' }}>
          <Button variant='secondary' onClick={() => this.syncRegistry(item)}>
            <Trans>Sync from registry</Trans>
          </Button>{' '}
          {dropdownItems.length > 0 && (
            <StatefulDropdown items={dropdownItems} />
          )}
        </td>
      </tr>
    );
  }

  private queryRegistries(noLoading = false) {
    this.setState(noLoading ? null : { loading: true }, () =>
      ExecutionEnvironmentRegistryAPI.list(this.state.params).then((result) => {
        const isAnyRunning = result.data.data.some((task) =>
          ['running', 'waiting'].includes(task.last_sync_task.state),
        );

        if (isAnyRunning) {
          setTimeout(() => this.queryRegistries(true), 5000);
        }

        this.setState({
          items: result.data.data,
          itemCount: result.data.meta.count,
          loading: false,
        });
      }),
    );
  }

  private deleteRegistry({ pk, name }) {
    ExecutionEnvironmentRegistryAPI.delete(pk)
      .then(() =>
        this.addAlert(
          t`Successfully deleted remote registry ${name}`,
          'success',
        ),
      )
      .catch(() =>
        this.addAlert(t`Failed to delete remote registry ${name}`, 'danger'),
      )
      .then(() => {
        this.queryRegistries();
        this.setState({ showDeleteModal: false, remoteToEdit: null });
      });
  }

  private syncRegistry({ pk, name }) {
    ExecutionEnvironmentRegistryAPI.sync(pk)
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
        this.queryRegistries(true);
      })
      .catch(() => this.addAlert(t`Sync failed for ${name}`, 'danger'));
  }

  private indexRegistry({ pk, name }) {
    ExecutionEnvironmentRegistryAPI.index(pk)
      .then((result) => {
        const task_id = parsePulpIDFromURL(result.data.task);
        this.addAlert(
          t`Indexing execution environments in ${name}`,
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
      .catch(() => this.addAlert(t`Indexing failed for ${name}`, 'danger'));
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

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(ExecutionEnvironmentRegistryList);
ExecutionEnvironmentRegistryList.contextType = AppContext;
