import * as React from 'react';

import { RouteComponentProps, Redirect } from 'react-router-dom';
import {
  ExecutionEnvironmentAPI,
  ContainerRepositoryType,
  ContainerDistributionAPI,
  ExecutionEnvironmentNamespaceAPI,
  GroupObjectPermissionType,
} from 'src/api';
import { formatPath, Paths } from '../../paths';
import { Button } from '@patternfly/react-core';
import {
  LoadingPageWithHeader,
  ExecutionEnvironmentHeader,
  Main,
  RepositoryForm,
} from 'src/components';

interface IState {
  repo: ContainerRepositoryType;
  loading: boolean;
  redirect: string;
  editing: boolean;
  selectedGroups: GroupObjectPermissionType[];
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
        repo: undefined,
        loading: true,
        redirect: undefined,
        editing: false,
        selectedGroups: [],
      };
    }
    componentDidMount() {
      ExecutionEnvironmentAPI.get(this.props.match.params['container'])
        .then(result => {
          const repo = result;
          ExecutionEnvironmentNamespaceAPI.get(result.data.namespace.name).then(
            result =>
              this.setState({
                loading: false,
                repo: repo.data,
                selectedGroups: result.data.groups,
              }),
          );
        })
        .catch(e => this.setState({ redirect: 'notFound' }));
    }
    render() {
      if (this.state.redirect === 'activity') {
        return (
          <Redirect
            to={formatPath(Paths.executionEnvironmentDetailActivities, {
              container: this.props.match.params['container'],
            })}
          />
        );
      } else if (this.state.redirect === 'detail') {
        return (
          <Redirect
            to={formatPath(Paths.executionEnvironmentDetail, {
              container: this.props.match.params['container'],
            })}
          />
        );
      } else if (this.state.redirect === 'images') {
        return (
          <Redirect
            to={formatPath(Paths.executionEnvironmentDetailImages, {
              container: this.props.match.params['container'],
            })}
          />
        );
      } else if (this.state.redirect === 'notFound') {
        return <Redirect to={Paths.notFound} />;
      }

      if (this.state.loading) {
        return <LoadingPageWithHeader />;
      }
      return (
        <React.Fragment>
          <ExecutionEnvironmentHeader
            id={this.props.match.params['container']}
            updateState={change => this.setState(change)}
            tab={this.getTab()}
            container={this.state.repo}
            pageControls={
              <Button onClick={() => this.setState({ editing: true })}>
                Edit
              </Button>
            }
          />
          <Main>
            {this.state.editing && (
              <RepositoryForm
                name={this.props.match.params['container']}
                selectedGroups={this.state.selectedGroups}
                description={this.state.repo.description}
                onSave={(description, selectedGroups) => {
                  let promises = [];
                  promises.push(
                    ContainerDistributionAPI.patch(
                      this.state.repo.pulp.distribution.pulp_id,
                      {
                        description: description,
                      },
                    ),
                  );
                  promises.push(
                    ExecutionEnvironmentNamespaceAPI.update(
                      this.state.repo.namespace.name,
                      { groups: selectedGroups },
                    ),
                  );
                  Promise.all(promises).then(() =>
                    this.setState({ editing: false }),
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
  };
}
