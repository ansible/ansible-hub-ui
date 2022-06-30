import { t, Trans } from '@lingui/macro';
import * as React from 'react';

import { Link, RouteComponentProps, Redirect } from 'react-router-dom';
import {
  ContainerRepositoryType,
  ExecutionEnvironmentAPI,
  ExecutionEnvironmentRemoteAPI,
} from 'src/api';
import { formatPath, Paths } from '../../paths';
import { Button, DropdownItem } from '@patternfly/react-core';
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
import { ParamHelper, parsePulpIDFromURL, waitForTask } from 'src/utilities';

import { AppContext } from 'src/loaders/app-context';

interface IState {
  publishToController: { digest?: string; image: string; tag?: string };
  repo: ContainerRepositoryType;
  loading: boolean;
  redirect: string;
  editing: boolean;
  alerts: AlertType[];
  showDeleteModal: boolean;
  formError: { title: string; detail: string }[];
}

export interface IDetailSharedProps extends RouteComponentProps {
  containerRepository: ContainerRepositoryType;
  addAlert: (alert: AlertType) => void;
}

// A higher order component to wrap individual detail pages
export function withContainerRepo(WrappedComponent) {
  return class extends React.Component<RouteComponentProps, IState> {
    static contextType = AppContext;
    static displayName = `withContainerRepo(${WrappedComponent.displayName})`;

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
        formError: [],
      };
    }

    componentDidMount() {
      this.loadRepo();
    }

    render() {
      const container = this.props.match.params['container'];
      const redirect = {
        list: formatPath(Paths.executionEnvironments, {}),
        activity: formatPath(Paths.executionEnvironmentDetailActivities, {
          container,
        }),
        detail: formatPath(Paths.executionEnvironmentDetail, {
          container,
        }),
        images: formatPath(Paths.executionEnvironmentDetailImages, {
          container,
        }),
        owners: formatPath(Paths.executionEnvironmentDetailOwners, {
          container,
        }),
        notFound: Paths.notFound,
      }[this.state.redirect];

      if (redirect) {
        return <Redirect push to={redirect} />;
      }

      if (this.state.loading) {
        return <LoadingPageWithHeader />;
      }
      const permissions = this.state.repo.namespace.my_permissions;
      const showEdit =
        permissions.includes(
          'container.namespace_change_containerdistribution',
        ) || permissions.includes('container.change_containernamespace');
      const dropdownItems = [
        this.state.repo.pulp.repository.remote && (
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
        this.context.user.model_permissions.delete_containerrepository && (
          <DropdownItem
            key='delete'
            onClick={() => {
              this.setState({ showDeleteModal: true });
            }}
          >
            {t`Delete`}
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
            id={this.props.match.params['container']}
            updateState={(change) => this.setState(change)}
            tab={this.getTab()}
            groupId={groupId}
            container={this.state.repo}
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
                formError={this.state.formError}
                onSave={(promise) => {
                  promise
                    .then((results) => {
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
                    })
                    .catch((err) =>
                      this.setState({
                        formError: err.response.data.errors.map((error) => {
                          return {
                            title: error.title,
                            detail:
                              error.source.parameter + ': ' + error.detail,
                          };
                        }),
                      }),
                    );
                }}
                onCancel={() => this.setState({ editing: false })}
                distributionPulpId={this.state.repo.pulp.distribution.pulp_id}
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
                remotePulpId={this.state.repo.pulp.repository.remote?.pulp_id}
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
      ExecutionEnvironmentAPI.get(this.props.match.params['container'])
        .then((result) => {
          this.setState({
            loading: false,
            repo: result.data,
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
      const tabs = ['detail', 'images', 'activity', 'owners'];
      const location = this.props.location.pathname.split('/');
      const index = location.findIndex((s) => s === '_content');

      // match /containers/owners/_content/owners but not /containers/owners
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
            <Trans>Sync started for remote registry &quot;{name}&quot;.</Trans>,
            'info',
            <span>
              <Trans>
                See the task management{' '}
                <Link to={formatPath(Paths.taskDetail, { task: task_id })}>
                  detail page{' '}
                </Link>
                for the status of this task.
              </Trans>
            </span>,
          );
          this.loadRepo();
        })
        .catch(() => this.addAlert(t`Sync failed for ${name}`, 'danger'));
    }
  };
}
