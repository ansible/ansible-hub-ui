import * as React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';

import { TrashIcon } from '@patternfly/react-icons';

import { GroupObjectPermissionType, GroupAPI } from '../../api';
import { APISearchTypeAhead, PermissionChipSelector } from '../../components';

interface IProps {
  groups: GroupObjectPermissionType[];
  availablePermissions: string[];
  setGroups: (groups: GroupObjectPermissionType[]) => void;

  menuAppendTo?: 'parent' | 'inline';
}

interface IState {
  searchGroups: { name: string; id: number | string }[];
}

export class ObjectPerissionField extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      searchGroups: [],
    };
  }

  componentDidMount() {
    this.loadGroups('');
  }

  render() {
    const { groups, availablePermissions } = this.props;

    return (
      <div>
        <APISearchTypeAhead
          results={this.state.searchGroups}
          loadResults={this.loadGroups}
          onSelect={this.onSelect}
          placeholderText='Find a group'
          menuAppendTo={this.props.menuAppendTo}
        />
        <br />
        <br />
        <div>
          {groups.map((group, i) => (
            <Flex
              style={{ marginTop: '16px' }}
              alignItems={{ default: 'alignItemsCenter' }}
              key={group.name}
            >
              <FlexItem style={{ minWidth: '200px' }}>{group.name}</FlexItem>
              <FlexItem grow={{ default: 'grow' }}>
                <PermissionChipSelector
                  availablePermissions={availablePermissions}
                  selectedPermissions={group.object_permissions}
                  setSelected={perms => this.setPermissions(perms, group)}
                  menuAppendTo={this.props.menuAppendTo}
                />
              </FlexItem>
              <FlexItem>
                <TrashIcon
                  style={{ cursor: 'pointer' }}
                  onClick={() => this.removeGroup(group)}
                />
              </FlexItem>
            </Flex>
          ))}
        </div>
      </div>
    );
  }

  private removeGroup(group) {
    const newGroups = [];
    for (const g of this.props.groups) {
      if (g.id !== group.id) {
        newGroups.push(g);
      }
    }

    this.props.setGroups(newGroups);
  }

  private setPermissions(perms, group) {
    const newGroups = [...this.props.groups];
    const selectedGroup = newGroups.find(g => g.id === group.id);
    selectedGroup.object_permissions = perms;

    this.props.setGroups(newGroups);
  }

  private loadGroups = name => {
    GroupAPI.list({ name__contains: name }).then(result =>
      this.setState({ searchGroups: result.data.data }),
    );
  };

  private onSelect = (event, selection, isPlaceholder) => {
    const newGroups = [...this.props.groups];

    const addedGroup = this.state.searchGroups.find(g => g.name === selection);

    newGroups.push({
      id: addedGroup.id as number,
      name: addedGroup.name,
      object_permissions: this.props.availablePermissions,
    });

    this.props.setGroups(newGroups);
  };
}
