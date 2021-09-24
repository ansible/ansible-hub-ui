import { t } from '@lingui/macro';
import * as React from 'react';

import { RouteComponentProps, Redirect } from 'react-router-dom';
import {
  ExecutionEnvironmentAPI,
  ContainerRepositoryType,
  ContainerDistributionAPI,
  ExecutionEnvironmentNamespaceAPI,
  GroupObjectPermissionType,
  TaskAPI,
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
import { isEqual, isEmpty, xorWith, cloneDeep } from 'lodash';

interface IState {
  publishToController: { digest?: string; image: string; tag?: string };
  repo: ContainerRepositoryType;
  loading: boolean;
  redirect: string;
  editing: boolean;
  selectedGroups: GroupObjectPermissionType[];
  alerts: AlertType[];
}

export interface IDetailSharedProps extends RouteComponentProps {
  containerRepository: ContainerRepositoryType;
}

// A higher order component to wrap individual detail pages
export function withContainerRepo(WrappedComponent) {
  return class extends React.Component<RouteComponentProps, IState> {
    constructor(props) {
      super(props);

      this.state = {
        publishToController: null,
        repo: undefined,
        loading: true,
        redirect: undefined,
        editing: false,
        selectedGroups: [],
        alerts: [],
      };
    }
    componentDidMount() {
      this.loadRepo();
    }
    render() {
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
      ];

      const { publishToController } = this.state;

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
          <ExecutionEnvironmentHeader
            id={this.props.match.params['container']}
            updateState={(change) => this.setState(change)}
            tab={this.getTab()}
            container={this.state.repo}
            pageControls={
              <>
                {showEdit ? (
                  <Button onClick={() => this.setState({ editing: true })}>
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
                selectedGroups={cloneDeep(this.state.selectedGroups)}
                description={this.state.repo.description}
                permissions={permissions}
                onSave={({ description, selectedGroups }) => {
                  let promises = [];
                  if (description !== this.state.repo.description) {
                    promises.push(
                      ContainerDistributionAPI.patch(
                        this.state.repo.pulp.distribution.pulp_id,
                        {
                          description: description,
                        },
                      ),
                    );
                  }
                  if (
                    !this.compareGroupsAndPerms(
                      selectedGroups.sort(),
                      this.state.selectedGroups.sort(),
                    )
                  ) {
                    promises.push(
                      ExecutionEnvironmentNamespaceAPI.update(
                        this.state.repo.namespace.name,
                        { groups: selectedGroups },
                      ),
                    );
                  }
                  Promise.all(promises)
                    .then((results) => {
                      let task = results.find((x) => x.data && x.data.task);
                      this.setState({ editing: false, loading: true });
                      if (!!task) {
                        this.waitForTask(
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

    //Compare groups and compare their permissions
    private compareGroupsAndPerms(original, newOne) {
      let same = true;
      if (original.length === newOne.length) {
        original.forEach((x, index) => {
          if (
            !isEmpty(
              xorWith(
                x.object_permissions.sort(),
                newOne[index].object_permissions.sort(),
                isEqual,
              ),
            )
          ) {
            same = false;
          }
        });
      }
      return isEmpty(xorWith(original, newOne, isEqual)) && same;
    }

    private loadRepo() {
      ExecutionEnvironmentAPI.get(this.props.match.params['container'])
        .then((result) => {
          const repo = result;
          return ExecutionEnvironmentNamespaceAPI.get(
            result.data.namespace.name,
          ).then((result) =>
            this.setState({
              loading: false,
              repo: repo.data,
              selectedGroups: result.data.groups,
            }),
          );
        })
        .catch((e) => this.setState({ redirect: 'notFound' }));
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

    private waitForTask(task) {
      return TaskAPI.get(task).then((result) => {
        if (result.data.state !== 'completed') {
          return new Promise((r) => setTimeout(r, 500)).then(() =>
            this.waitForTask(task),
          );
        }
      });
    }
    private get closeAlert() {
      return closeAlertMixin('alerts');
    }
  };
}
