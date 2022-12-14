import * as React from 'react';
import { t } from '@lingui/macro';
import { AppContext } from 'src/loaders/app-context';
import { RoleType, GroupRoleType, PermissionType } from 'src/api';
import { PermissionChipSelector } from 'src/components';

import { Flex, FlexItem } from '@patternfly/react-core';

interface IState {
  groups: PermissionType[];
}

interface IProps {
  showEmpty: boolean;
  showCustom: boolean;
  role: RoleType | GroupRoleType;
}

export class PermissionCategories extends React.Component<IProps, IState> {
  static contextType = AppContext;
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
    };
  }

  componentDidMount() {
    const { model_permissions } = this.context.user;
    this.setState({ groups: this.formatPermissions(model_permissions) });
  }

  render() {
    const { groups } = this.state;
    const { role, showEmpty, showCustom } = this.props;

    const origGroups = groups.map((group) => ({
      ...group,
      label: group.label,
    }));

    const allGroups = showCustom
      ? [
          ...origGroups,
          {
            label: t`Custom permissions`,
            object_permissions: this.customPermissions(role),
          },
        ]
      : origGroups;

    const groupsToMap = showEmpty
      ? allGroups
      : allGroups.filter((group) => this.getSelected(group).length);

    return (
      <React.Fragment>
        {groupsToMap.map((group) => (
          <Flex
            style={{ marginTop: '16px' }}
            alignItems={{ default: 'alignItemsCenter' }}
            key={group.label}
            className={group.label}
          >
            <FlexItem style={{ minWidth: '200px' }}>{group.label}</FlexItem>
            <FlexItem grow={{ default: 'grow' }}>
              <PermissionChipSelector
                availablePermissions={group.object_permissions
                  .filter(
                    (perm) =>
                      !role.permissions.find((selected) => selected === perm),
                  )
                  .map((permission) => this.getNicenames(permission))
                  .sort()}
                selectedPermissions={role.permissions
                  .filter((selected) =>
                    group.object_permissions.find((perm) => selected === perm),
                  )
                  .map((permission) => this.getNicenames(permission))}
                menuAppendTo='inline'
                isViewOnly={true}
              />
            </FlexItem>
          </Flex>
        ))}
      </React.Fragment>
    );
  }

  private formatPermissions(permissions): PermissionType[] {
    const formattedPermissions = {};
    for (const [key, value] of Object.entries(permissions)) {
      if (value['ui_category'] in formattedPermissions) {
        formattedPermissions[value['ui_category']]['object_permissions'].push(
          key,
        );
      } else {
        formattedPermissions[value['ui_category']] = {
          label: value['ui_category'],
          object_permissions: [key],
        };
      }
    }
    const arrayPermissions = Object.values(
      formattedPermissions,
    ) as PermissionType[];
    return arrayPermissions;
  }

  private getNicenames(permission) {
    const { model_permissions } = this.context.user;
    if (model_permissions[permission].name !== undefined) {
      return model_permissions[permission].name;
    } else {
      return undefined;
    }
  }

  private permFilter(availablePermissions) {
    const { role } = this.props;
    return role.permissions
      .filter((selected) =>
        availablePermissions.find((perm) => selected === perm),
      )
      .map((permission) => this.getNicenames(permission));
  }

  private getSelected(group) {
    return this.permFilter(group.object_permissions);
  }

  private customPermissions(role) {
    const { model_permissions } = this.context.user;
    const custom = role.permissions.filter(
      (perm) => !Object.keys(model_permissions).includes(perm),
    );
    return custom;
  }
}
