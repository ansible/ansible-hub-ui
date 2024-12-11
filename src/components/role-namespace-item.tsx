import { t } from '@lingui/core/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { type LegacyNamespaceDetailType } from 'src/api';
import { Logo, StatefulDropdown } from 'src/components';
import { useHubContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import './list-item.scss';

interface RoleNamespaceProps {
  namespace: LegacyNamespaceDetailType;
  openEditModal?: (namespace) => void;
  openLightspeedModal?: (namespace) => void;
}

export function RoleNamespaceItem({
  namespace,
  openEditModal,
  openLightspeedModal,
}: RoleNamespaceProps) {
  const {
    featureFlags: { ai_deny_index },
    user: { username, is_superuser },
  } = useHubContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { id, avatar_url, name, summary_fields } = namespace;

  const namespace_url = formatPath(Paths.standaloneNamespace, {
    namespaceid: id,
  });

  const cells = [
    <DataListCell isFilled={false} key='ns'>
      <Logo
        alt='logo'
        fallbackToDefault
        image={avatar_url}
        size='40px'
        unlockWidth
        width='97px'
      />
    </DataListCell>,
    <DataListCell key='content' size={10}>
      <div>
        <Link to={namespace_url}>{name}</Link>
      </div>
    </DataListCell>,
  ];

  const isOwner = !!summary_fields.owners.find((n) => n.username == username);
  const showLightspeed = ai_deny_index && (is_superuser || isOwner);
  const canImport = is_superuser || isOwner;

  const dropdownItems = [
    showLightspeed && openLightspeedModal && (
      <DropdownItem
        onClick={() => openLightspeedModal(namespace)}
      >{t`Ansible Lightspeed settings`}</DropdownItem>
    ),
    is_superuser && openEditModal && (
      <DropdownItem
        onClick={() => openEditModal(namespace)}
      >{t`Change provider namespace`}</DropdownItem>
    ),
    canImport && (
      <DropdownItem
        onClick={() =>
          navigate(
            formatPath(
              Paths.standaloneRoleImport,
              {},
              {
                github_user: namespace.name,
                back: location.pathname,
              },
            ),
          )
        }
      >{t`Import role`}</DropdownItem>
    ),
  ].filter(Boolean);

  if (dropdownItems.length) {
    cells.push(
      <DataListCell key='menu' alignRight>
        <div style={{ float: 'right' }}>
          <StatefulDropdown items={dropdownItems} />
        </div>
      </DataListCell>,
    );
  }

  return (
    <DataListItem data-cy='RoleNamespaceItem'>
      <DataListItemRow>
        <DataListItemCells dataListCells={cells} />
      </DataListItemRow>
    </DataListItem>
  );
}
