import { Trans } from '@lingui/macro';
import React from 'react';
import { Flex, FlexItem, Label, Divider } from '@patternfly/react-core';
import { RoleType, GroupType } from 'src/api';
import { Tooltip } from 'src/components';
import { Constants } from 'src/constants';
import { translateLockedRolesDescription } from 'src/utilities';

interface Props {
  group: GroupType;
  selectedRoles: RoleType[];
}

const splitByDot = (perm: string) => {
  const [category, permission] = perm.split('.', 2);
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  return (
    <>
      <strong>{catTitle}:</strong>&nbsp;{permission}
    </>
  );
};

export const PreviewRoles = ({ group, selectedRoles }: Props) => (
  <div className='hub-custom-wizard-layout'>
    <p>
      <Trans>
        The following roles will be applied to group:{' '}
        <strong>{group.name}</strong>
      </Trans>
    </p>
    <Flex direction={{ default: 'column' }} className='hub-preview-roles'>
      {selectedRoles.map((role) => (
        <React.Fragment key={role.name}>
          <FlexItem>
            <strong>{role.name}</strong>{' '}
            {role?.description &&
              `- ${translateLockedRolesDescription(
                role.name,
                role.description,
              )}`}
            <Flex className='hub-permissions'>
              {role.permissions.map((permission) => (
                <FlexItem
                  key={permission}
                  className='hub-permission'
                  data-cy={`HubPermission-${permission}`}
                >
                  <Tooltip
                    content={
                      Constants.HUMAN_PERMISSIONS[permission] || permission
                    }
                  >
                    <Label>{splitByDot(permission)}</Label>
                  </Tooltip>
                </FlexItem>
              ))}
            </Flex>
          </FlexItem>
          <FlexItem>
            <Divider />
          </FlexItem>
        </React.Fragment>
      ))}
    </Flex>
  </div>
);
