import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { ExecutionEnvironmentNamespaceAPI, GroupType, GroupAPI } from 'src/api';
import { EEOwnersTab } from 'src/components';
import { formatPath, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { ParamHelper } from 'src/utilities';
import './execution-environment-detail.scss';

import { withContainerRepo, IDetailSharedProps } from './base';

interface IState {
  name: string;
  groups: GroupType[];
  canEditOwners: boolean;
  selectedGroup: GroupType;
  params: {
    group?: number;
  };
}

class ExecutionEnvironmentDetailOwners extends React.Component<
  IDetailSharedProps,
  IState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(this.props.location.search);

    this.state = {
      name: props.containerRepository.name,
      groups: null, // loading
      canEditOwners: false,
      selectedGroup: null,
      params,
    };
  }

  componentDidMount() {
    this.queryNamespace(this.props.containerRepository.namespace);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const params = ParamHelper.parseParamString(this.props.location.search);

      if (!params['group']) {
        this.setState({
          selectedGroup: null,
        });
      }

      this.setState({ params }, () =>
        this.queryNamespace(this.props.containerRepository.namespace),
      );
    }
  }

  render() {
    const { name, groups, selectedGroup, canEditOwners } = this.state;
    const loadAll = () =>
      this.queryNamespace(this.props.containerRepository.namespace);

    return (
      <OwnersTab
        canEditOwners={canEditOwners}
        addAlert={this.props.addAlert}
        group={selectedGroup}
        groups={groups}
        name={name}
        pulpObjectType='pulp_container/namespaces'
        reload={loadAll}
        selectRolesMessage={t`The selected roles will be added to this specific Execution Environment.`}
        urlPrefix={formatPath(Paths.executionEnvironmentDetailOwners, {
          container: name,
        })}
        namespaceId={this.props.containerRepository.namespace.id}
      />
    );
  }

  queryNamespace(name) {
    ExecutionEnvironmentNamespaceAPI.get(name).then(({ data: { groups } }) =>
      this.setState({ 
        name, 
        groups,
        canEditOwners: 
          my_permissions.includes('container.change_containernamespace') ||
          hasPermission('container.change_containernamespace'),
    });
  }
}

ExecutionEnvironmentDetailOwners.contextType = AppContext;

export default withRouter(withContainerRepo(ExecutionEnvironmentDetailOwners));
