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
    const { name, groups, canEditOwners, selectedGroup } = this.state;
    const loadAll = () =>
      this.queryNamespace(this.props.containerRepository.namespace);

    return (
      <EEOwnersTab
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

  querySelectedGroup(name, groups) {
    GroupAPI.list({ name }).then(({ data: { data } }) => {
      this.setState({
        selectedGroup: groups.find((g) => g.name === data[0].name),
      });
    });
  }

  queryNamespace({ id, name: repoName }) {
    ExecutionEnvironmentNamespaceAPI.listRoles(id)
      .then(({ data: { roles } }) => {
        const groupRoles = [];
        for (const { groups, role } of roles) {
          for (const name of groups) {
            const groupIndex = groupRoles.findIndex((g) => g.name === name);
            if (groupIndex == -1) {
              groupRoles.push({ name, object_roles: [role] });
            } else {
              groupRoles[groupIndex].object_roles.push(role);
            }
          }
        }

        this.setState({ name: repoName, groups: groupRoles });

        if (this.state.params?.group) {
          this.querySelectedGroup(this.state.params.group, groupRoles);
        }

        this.queryMyPermissions(id);
      })
      .catch(() => {
        this.setState({
          groups: [],
        });
      });
  }

  queryMyPermissions(id) {
    ExecutionEnvironmentNamespaceAPI.myPermissions(id).then(
      ({ data: { permissions } }) => {

        this.setState({
          canEditOwners: 
            permissions.includes('container.change_containernamespace') ||
            hasPermission('container.change_containernamespace'),
        });
      },
    );
  }
}

ExecutionEnvironmentDetailOwners.contextType = AppContext;

export default withRouter(withContainerRepo(ExecutionEnvironmentDetailOwners));
