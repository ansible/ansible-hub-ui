import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { NamespaceOwnersForm } from '../../components';
import './execution-environment-detail.scss';

import { withContainerRepo, IDetailSharedProps } from './base';

interface IState {}

class ExecutionEnvironmentDetailOwners extends React.Component<
  IDetailSharedProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.queryOwners(this.props.containerRepository.name);
  }

  render() {
    const namespace = {
      groups: [],
    } as any; // TODO

    return (
      <NamespaceOwnersForm
        namespace={namespace}
        updateNamespace={(_p) => null /* TODO */}
        addAlert={(alert) => null /* TODO */}
        location={this.props.location}
        history={this.props.history}
      />
    );
  }

  queryOwners(name) {}
}

export default withRouter(withContainerRepo(ExecutionEnvironmentDetailOwners));
