import React from 'react';
import { Flex, FlexItem, Label, Divider } from '@patternfly/react-core';

import { RoleType, GroupObjectPermissionType } from 'src/api';

import { Tooltip } from 'src/components';

import { Constants } from 'src/constants';

import './group-detail-role-management.scss';

interface Props {
  group: GroupObjectPermissionType;
  selectedRoles: RoleType[];
}

const splitByDot = (perm: string) => {
  const [category, permission] = perm.split('.');
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  return (
    <>
      <strong>{catTitle}:</strong>&nbsp;{permission}
    </>
  );
};

const PreviewRoles = ({ group, selectedRoles }: Props) =>
  Object.keys(selectedRoles).length <= 0 ? (
    <div>No roles selected</div>
  ) : (
    <div className='custom-wizard-layout'>
      <p>
        The following roles will be applied to group:{' '}
        <strong>{group.name}</strong>
      </p>
      <Flex direction={{ default: 'column' }} className='preview-roles'>
        {selectedRoles.map((role) => (
          <React.Fragment key={role.name}>
            <FlexItem>
              <strong>{role.name}</strong>{' '}
              {role?.description && `- ${role?.description}`}
              <Flex className='permissions'>
                {role.permissions.map((permission) => (
                  <FlexItem key={permission} className='permission'>
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
export default PreviewRoles;
