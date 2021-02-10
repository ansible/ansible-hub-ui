import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { BaseHeader, Main } from '../../components';

interface IState {
  loading: boolean;
  container: any;
}

class ExecutionEnvironmentDetail extends React.Component<
  RouteComponentProps,
  IState
> {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      container: { name: this.props.match.params['container'] },
    };
  }

  componentDidMount() {
    this.setState({ loading: false });
  }

  render() {
    return (
      <React.Fragment>
        <BaseHeader title={this.state.container.name}>
          I am looong description
        </BaseHeader>
        <Main></Main>
      </React.Fragment>
    );
  }
}

export default withRouter(ExecutionEnvironmentDetail);
