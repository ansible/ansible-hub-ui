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
  ExecutionEnvironmentHeader,
  LoadingPageWithHeader,
  Main,
  PublishToControllerModal,
  RepositoryForm,
  StatefulDropdown,
  closeAlertMixin,
} from 'src/components';
import { parsePulpIDFromURL, waitForTask } from 'src/utilities';

import { AppContext } from 'src/loaders/app-context';

import { DeleteExecutionEnviromentModal } from 'src/containers/execution-environment-detail/delete-execution-enviroment-modal';

interface IState {
  publishToController: { digest?: string; image: string; tag?: string };
  repo: ContainerRepositoryType;
  loading: boolean;
  redirect: string;
  editing: boolean;
  alerts: AlertType[];
  showDeleteModal: boolean;
}

export interface IDetailSharedProps extends RouteComponentProps {
  containerRepository: ContainerRepositoryType;
}

// A higher order component to wrap individual detail pages
export function withContainerRepo(WrappedComponent) {
  return class extends React.Component<RouteComponentProps, IState> {
    static contextType = AppContext;
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

    render() {
      if (this.state.redirect === 'list') {
        return (
          <Redirect push to={formatPath(Paths.executionEnvironments, {})} />
        );
      }
      if (this.state.redirect === 'activity') {
        return (
          <Redirect
            push
            to={formatPath(Paths.executionEnvironmentDetailActivities, {
              container: this.props.match.params['container'],
            })}
          />
        );
      } else if (this.state.redirect === 'detail') {
        return (
          <Redirect
            push
            to={formatPath(Paths.executionEnvironmentDetail, {
              container: this.props.match.params['container'],
            })}
          />
        );
      } else if (this.state.redirect === 'images') {
        return (
          <Redirect
            push
            to={formatPath(Paths.executionEnvironmentDetailImages, {
              container: this.props.match.params['container'],
            })}
          />
        );
      } else if (this.state.redirect === 'notFound') {
        return <Redirect push to={Paths.notFound} />;
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
      let selectedItem = repo.name;

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
            <DeleteExecutionEnviromentModal
              selectedItem={selectedItem}
              closeAction={() => this.setState({ showDeleteModal: false })}
              afterDelete={() => this.setState({ redirect: 'list' })}
              addAlert={(text, variant, description = undefined) =>
                this.setState({
                  alerts: alerts.concat([
                    { title: text, variant: variant, description: description },
                  ]),
                })
              }
            ></DeleteExecutionEnviromentModal>
          )}
          <ExecutionEnvironmentHeader
            id={this.props.match.params['container']}
            updateState={(change) => this.setState(change)}
            tab={this.getTab()}
            container={this.state.repo}
            pageControls={
              <>
                {showEdit ? (
                  <Button
                    onClick={() => this.setState({ editing: true })}
                    variant={'secondary'}
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
                  promise
                    .then((results) => {
                      const task = results.find((x) => x.data && x.data.task);
                      this.setState({ editing: false, loading: true });
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
                    .catch(() =>
                      this.setState({
                        editing: false,
                        alerts: this.state.alerts.concat({
                          variant: 'danger',
                          title: t`Error: changes weren't saved`,
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
                  this.state.repo.pulp.repository.remote?.exclude_tags
                }
                includeTags={
                  this.state.repo.pulp.repository.remote?.include_tags
                }
                remotePulpId={this.state.repo.pulp.repository.remote?.pulp_id}
              />
            )}
            <WrappedComponent
              containerRepository={this.state.repo}
              editing={this.state.editing}
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
      const tabs = ['detail', 'images', 'activity'];
      const location = this.props.location.pathname.split('/').pop();

      for (const tab of tabs) {
        if (location.includes(tab)) {
          return tab;
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
          this.loadRepo();
        })
        .catch(() => this.addAlert(t`Sync failed for ${name}`, 'danger'));
    }
  };
}
