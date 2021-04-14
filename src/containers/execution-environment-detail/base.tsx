import * as React from 'react';

import { RouteComponentProps, Redirect } from 'react-router-dom';
import { ExecutionEnvironmentAPI, ContainerRepositoryType } from 'src/api';
import { formatPath, Paths } from '../../paths';

import {
  LoadingPageWithHeader,
  ExecutionEnvironmentHeader,
} from 'src/components';

interface IState {
  repo: ContainerRepositoryType;
  loading: boolean;
  redirect: string;
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
      };
    }
    componentDidMount() {
      ExecutionEnvironmentAPI.get(this.props.match.params['container'])
        .then(result => {
          this.setState({ loading: false, repo: result.data });
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
          />
          <WrappedComponent
            containerRepository={this.state.repo}
            {...this.props}
          />
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
