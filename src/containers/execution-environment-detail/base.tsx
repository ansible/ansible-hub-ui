import { Trans, t } from '@lingui/macro';
import { Button, DropdownItem } from '@patternfly/react-core';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import {
  ContainerRepositoryType,
  ExecutionEnvironmentAPI,
  ExecutionEnvironmentRemoteAPI,
} from 'src/api';
import {
  AlertList,
  AlertType,
  DeleteExecutionEnvironmentModal,
  ExecutionEnvironmentHeader,
  LoadingPageWithHeader,
  Main,
  PublishToControllerModal,
  RepositoryForm,
  StatefulDropdown,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatEEPath, formatPath } from 'src/paths';
import {
  ParamHelper,
  RepoSigningUtils,
  RouteProps,
  canSignEE,
  taskAlert,
  waitForTask,
} from 'src/utilities';

interface IState {
  publishToController: { digest?: string; image: string; tag?: string };
  repo: ContainerRepositoryType;
  loading: boolean;
  redirect: string;
  editing: boolean;
  alerts: AlertType[];
  showDeleteModal: boolean;
}

export interface IDetailSharedProps extends RouteProps {
  containerRepository: ContainerRepositoryType;
  addAlert: (alert: AlertType) => void;
}

// opposite of formatEEPath - converts routeParams from {namespace, container} to {container: "namespace/container"}
export function withContainerParamFix(WrappedComponent) {
  const Component = (props: RouteProps) => {
    const newProps = {
      ...props,
      routeParams: {
        ...props.routeParams,
        container: [props.routeParams.namespace, props.routeParams.container]
          .filter(Boolean)
          .join('/'),
      },
    };
    return <WrappedComponent {...newProps} />;
  };

  Component.displayName = `withContainerParamFix(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;
  return Component;
}

// A higher order component to wrap individual detail pages
export function withContainerRepo(WrappedComponent) {
  return class extends React.Component<RouteProps, IState> {
    static contextType = AppContext;
    static displayName = `withContainerRepo(${
      WrappedComponent.displayName || WrappedComponent.name
    })`;

    constructor(props) {
      super(props);

      this.state = {
        publishToController: null,
        repo: undefined,
        loading: true,
        redirect: undefined,
        editing: false,
        alerts: [],
        showDeleteModal: false,
      };
    }

    componentDidMount() {
      this.loadRepo();
    }

    componentDidUpdate() {
      // when reloading the same tab, state doesn't reset
      if (this.state.redirect) {
        this.setState({ redirect: null });
      }
    }

    render() {
      const container = this.props.routeParams.container;
      const redirect = {
        list: formatEEPath(Paths.executionEnvironments, {}),
        activity: formatEEPath(Paths.executionEnvironmentDetailActivities, {
          container,
        }),
        detail: formatEEPath(Paths.executionEnvironmentDetail, {
          container,
        }),
        images: formatEEPath(Paths.executionEnvironmentDetailImages, {
          container,
        }),
        access: formatEEPath(Paths.executionEnvironmentDetailAccess, {
          container,
        }),
        notFound: formatPath(Paths.notFound),
      }[this.state.redirect];

      if (redirect) {
        return <Navigate to={redirect} />;
      }

      if (this.state.loading) {
        return <LoadingPageWithHeader />;
      }

      const permissions = this.state.repo.namespace.my_permissions;
      const showEdit =
        permissions.includes(
          'container.namespace_change_containerdistribution',
        ) || permissions.includes('container.change_containernamespace');
      const canSync = permissions.includes(
        'container.change_containernamespace',
      );
      const { hasPermission } = this.context;
      const dropdownItems = [
        this.state.repo.pulp.repository.remote && canSync && (
          <DropdownItem
            key='sync'
            onClick={() => this.sync(this.state.repo.name)}
            isDisabled={['running', 'waiting'].includes(
              this.state.repo.pulp.repository.remote?.last_sync_task?.state,
            )}
          >
            {t`Sync from registry`}
          </DropdownItem>
        ),
        <DropdownItem
          key='publish-to-controller'
          onClick={() => {
            this.setState({
              publishToController: {
                image: this.state.repo.name,
              },
            });
          }}
        >
          {t`Use in Controller`}
        </DropdownItem>,
        hasPermission('container.delete_containerrepository') && (
          <DropdownItem
            key='delete'
            onClick={() => {
              this.setState({ showDeleteModal: true });
            }}
          >
            {t`Delete`}
          </DropdownItem>
        ),
        this.state.repo && canSignEE(this.context, this.state.repo) && (
          <DropdownItem
            key='sign'
            onClick={() => {
              this.sign();
            }}
          >
            {t`Sign`}
          </DropdownItem>
        ),
      ].filter((truthy) => truthy);

      const { alerts, repo, publishToController, showDeleteModal } = this.state;

      // move to Owner tab when it can have its own breadcrumbs
      const { group: groupId } = ParamHelper.parseParamString(
        this.props.location.search,
      ) as { group?: number };

      return (
        <React.Fragment>
          <AlertList
            alerts={this.state.alerts}
            closeAlert={(i) => this.closeAlert(i)}
          />
          <PublishToControllerModal
            digest={publishToController?.digest}
            image={publishToController?.image}
            isOpen={!!publishToController}
            onClose={() => this.setState({ publishToController: null })}
            tag={publishToController?.tag}
          />
          {showDeleteModal && (
            <DeleteExecutionEnvironmentModal
              selectedItem={repo.name}
              closeAction={() => this.setState({ showDeleteModal: false })}
              afterDelete={() => {
                this.context.setAlerts(this.state.alerts);
                this.setState({ redirect: 'list' });
              }}
              addAlert={(text, variant, description = undefined) =>
                this.addAlert(text, variant, description)
              }
            ></DeleteExecutionEnvironmentModal>
          )}
          <ExecutionEnvironmentHeader
            id={this.props.routeParams.container}
            updateState={(change) => this.setState(change)}
            tab={this.getTab()}
            groupId={groupId}
            container={this.state.repo}
            displaySignatures={this.context.featureFlags.container_signing}
            pageControls={
              <>
                {showEdit ? (
                  <Button
                    onClick={() => this.setState({ editing: true })}
                    variant={'secondary'}
                    data-cy='edit-container'
                  >
                    {t`Edit`}
                  </Button>
                ) : null}
                <StatefulDropdown items={dropdownItems}></StatefulDropdown>
              </>
            }
          />
          <Main>
            {this.state.editing && (
              <RepositoryForm
                name={this.state.repo.name}
                namespace={this.state.repo.namespace.name}
                description={this.state.repo.description}
                permissions={permissions}
                onSave={(promise) => {
                  promise.then((results) => {
                    const task = results.find((x) => x.data && x.data.task);
                    this.setState({
                      editing: false,
                      loading: true,
                      alerts: alerts.concat({
                        variant: 'success',
                        title: (
                          <Trans>
                            Saved changes to execution environment &quot;
                            {this.state.repo.name}&quot;.
                          </Trans>
                        ),
                      }),
                    });
                    if (task) {
                      waitForTask(
                        task.data.task.split('tasks/')[1].replace('/', ''),
                      ).then(() => {
                        this.loadRepo();
                      });
                    } else {
                      this.loadRepo();
                    }
                  });
                }}
                onCancel={() => this.setState({ editing: false })}
                distributionPulpId={this.state.repo.pulp.distribution.id}
                isRemote={!!this.state.repo.pulp.repository.remote}
                isNew={false}
                upstreamName={
                  this.state.repo.pulp.repository.remote?.upstream_name
                }
                registry={this.state.repo.pulp.repository.remote?.registry}
                excludeTags={
                  this.state.repo.pulp.repository.remote?.exclude_tags || []
                }
                includeTags={
                  this.state.repo.pulp.repository.remote?.include_tags || []
                }
                remoteId={this.state.repo.pulp.repository.remote?.id}
              />
            )}
            <WrappedComponent
              containerRepository={this.state.repo}
              editing={this.state.editing}
              addAlert={({ title, variant, description = null }) =>
                this.addAlert(title, variant, description)
              }
              {...this.props}
            />
          </Main>
        </React.Fragment>
      );
    }

    private loadRepo() {
      ExecutionEnvironmentAPI.get(this.props.routeParams.container)
        .then((result) => {
          this.setState({
            repo: result.data,
            loading: false,
          });

          const last_sync_task =
            result.data.pulp.repository.remote?.last_sync_task || {};
          if (
            last_sync_task.state &&
            ['running', 'waiting'].includes(last_sync_task.state)
          ) {
            // keep refreshing while a remove repo is being synced
            setTimeout(() => this.loadRepo(), 10000);
          }
        })
        .catch(() => this.setState({ redirect: 'notFound' }));
    }

    private getTab() {
      const tabs = ['detail', 'images', 'activity', 'access'];
      const location = this.props.location.pathname.split('/');
      const index = location.findIndex((s) => s === '_content');

      // match /containers/access/_content/access but not /containers/access
      // also handles /containers/:name/_content/images/:digest
      if (index !== -1) {
        const loc = location[index + 1];
        for (const tab of tabs) {
          if (loc === tab) {
            return tab;
          }
        }
      }

      return 'detail';
    }

    private get closeAlert() {
      return closeAlertMixin('alerts');
    }

    private addAlert(title, variant, description?) {
      this.addAlertObj({
        description,
        title,
        variant,
      });
    }

    private addAlertObj(alert: AlertType) {
      this.setState({
        alerts: [...this.state.alerts, alert],
      });
    }

    private sync(name) {
      ExecutionEnvironmentRemoteAPI.sync(name)
        .then(({ data }) => {
          this.addAlertObj(
            taskAlert(
              data.task,
              t`Sync started for remote registry "${name}".`,
            ),
          );
          this.loadRepo();
        })
        .catch(() => this.addAlert(t`Sync failed for ${name}`, 'danger'));
    }

    private sign() {
      RepoSigningUtils.sign(
        this.state.repo,
        this.context,
        (alert) => this.addAlertObj(alert),
        () => this.loadRepo(),
      );
    }
  };
}
