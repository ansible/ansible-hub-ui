import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { ExecutionEnvironmentNamespaceAPI, GroupType } from 'src/api';
import { OwnersTab } from 'src/components';
import { formatPath, Paths } from 'src/paths';
import { ParamHelper } from 'src/utilities';
import './execution-environment-detail.scss';

import { withContainerRepo, IDetailSharedProps } from './base';

interface IState {
  name: string;
  groups: GroupType[];
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
    const { name, groups, params } = this.state;
    const loadAll = () =>
      this.queryNamespace(this.props.containerRepository.name);

    return (
      <OwnersTab
        addAlert={this.props.addAlert}
        groupId={params.group}
        groups={groups}
        name={name}
        reload={loadAll}
        selectRolesMessage={t`The selected roles will be added to this specific Execution Environment.`}
        updateGroups={(groups) =>
          ExecutionEnvironmentNamespaceAPI.update(name, {
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
    ExecutionEnvironmentNamespaceAPI.get(name).then(({ data: { groups } }) =>
      this.setState({ name, groups }),
    );
  }
}

export default withRouter(withContainerRepo(ExecutionEnvironmentDetailOwners));
