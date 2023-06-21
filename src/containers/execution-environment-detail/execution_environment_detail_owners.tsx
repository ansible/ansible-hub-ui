import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { ExecutionEnvironmentNamespaceAPI, GroupType } from 'src/api';
import { OwnersTab } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper } from 'src/utilities';
import { IDetailSharedProps, withContainerRepo } from './base';
import './execution-environment-detail.scss';

interface IState {
  name: string;
  groups: GroupType[];
  canEditOwners: boolean;
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
      params,
    };
  }

  componentDidMount() {
    this.queryNamespace(this.props.containerRepository.name);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const params = ParamHelper.parseParamString(this.props.location.search);
      this.setState({ params });
    }
  }

  render() {
    const { name, groups, params, canEditOwners } = this.state;
    const loadAll = () =>
      this.queryNamespace(this.props.containerRepository.name);

    return (
      <OwnersTab
        canEditOwners={canEditOwners}
        addAlert={this.props.addAlert}
        groupId={params.group}
        groups={groups}
        name={name}
        pulpObjectType='pulp_container/namespaces'
        reload={loadAll}
        selectRolesMessage={t`The selected roles will be added to this specific Execution Environment.`}
        updateGroups={(groups) =>
          ExecutionEnvironmentNamespaceAPI.update(this.getNamespace(name), {
            groups,
          })
        }
        urlPrefix={formatPath(Paths.executionEnvironmentDetailOwners, {
          container: name,
        })}
      />
    );
  }

  queryNamespace(name) {
    const namespace = this.getNamespace(name);

    ExecutionEnvironmentNamespaceAPI.get(namespace).then(
      ({ data: { groups, my_permissions } }) =>
        this.setState({
          name: name,
          groups: groups,
          canEditOwners:
            my_permissions.includes('container.change_containernamespace') ||
            this.context.user.model_permissions.change_containernamespace,
        }),
    );
  }

  // filter namespace name
  private getNamespace(name) {
    return name.includes('/') ? name.split('/')[0] : name;
  }
}

ExecutionEnvironmentDetailOwners.contextType = AppContext;

export default withRouter(withContainerRepo(ExecutionEnvironmentDetailOwners));
