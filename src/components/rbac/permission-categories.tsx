import * as React from 'react';
import { i18n } from '@lingui/core';
import { AppContext } from 'src/loaders/app-context';
import { RoleType, PermissionType } from 'src/api';
import { PermissionChipSelector } from 'src/components';

import { Flex, FlexItem } from '@patternfly/react-core';

interface IState {
  groups: PermissionType[];
}

interface IProps {
  showEmpty: boolean;
  showCustom: boolean;
  role: RoleType;
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
    const { role } = this.props;

    const permFilter = (availablePermissions) =>
      role.permissions
        .filter((selected) =>
          availablePermissions.find((perm) => selected === perm),
        )
        .map((permission) => this.getNicenames(permission));

    const getSelected = (group) => permFilter(group.object_permissions);

    const customPermissions = selectedPermissions.filter(
      (perm) => !Object.keys(filteredPermissions).includes(perm),
    );

    const origGroups = Constants.PERMISSIONS.map((group) => ({
      ...group,
      label: i18n._(group.label),
    }));
    const allGroups = showCustom
      ? [
          ...origGroups,
          {
            name: 'custom',
            label: t`Custom permissions`,
            object_permissions: customPermissions,
          },
        ]
      : origGroups;
    const groups = showEmpty
      ? allGroups
      : allGroups.filter((group) => getSelected(group).length);

    return (
      <React.Fragment>
        {groups.map((group) => (
          <Flex
            style={{ marginTop: '16px' }}
            alignItems={{ default: 'alignItemsCenter' }}
            key={group.label}
            className={group.label}
          >
            <FlexItem style={{ minWidth: '200px' }}>
              {i18n._(group.label)}
            </FlexItem>
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
                multilingual={true}
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
}
