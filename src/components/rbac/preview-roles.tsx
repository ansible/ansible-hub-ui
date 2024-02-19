import { Trans } from '@lingui/macro';
import { Divider, Flex, FlexItem, Label } from '@patternfly/react-core';
import React, { Fragment } from 'react';
import { RoleType } from 'src/api';
import { Tooltip } from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { translateLockedRole } from 'src/utilities';

interface Props {
  selectedRoles: RoleType[];
  user?: {
    username: string;
  };
  group?: {
    name: string;
  };
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

export const PreviewRoles = ({ user, group, selectedRoles }: Props) => {
  const { model_permissions } = useContext().user;

  return (
    <div className='hub-custom-wizard-layout'>
      <p>
        {user ? (
          <Trans>
            The following roles will be applied to user:{' '}
            <strong>{user.username}</strong>
          </Trans>
        ) : null}
        {group ? (
          <Trans>
            The following roles will be applied to group:{' '}
            <strong>{group.name}</strong>
          </Trans>
        ) : null}
      </p>
      <Flex direction={{ default: 'column' }} className='hub-preview-roles'>
        {selectedRoles.map((role) => (
          <Fragment key={role.name}>
            <FlexItem>
              <strong>{role.name}</strong>{' '}
              {role.description &&
                `- ${translateLockedRole(role.name, role.description)}`}
              <Flex className='hub-permissions'>
                {role.permissions.map((permission) => (
                  <FlexItem
                    key={permission}
                    className='hub-permission'
                    data-cy={`HubPermission-${permission}`}
                  >
                    <Tooltip
                      content={
                        model_permissions[permission]?.name || permission
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
          </Fragment>
        ))}
      </Flex>
    </div>
  );
};
