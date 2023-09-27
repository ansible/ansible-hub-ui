import { t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DropdownItem,
} from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { LegacyNamespaceDetailType } from 'src/api';
import { Logo, StatefulDropdown } from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import './legacy-namespace-item.scss';

interface LegacyNamespaceProps {
  namespace: LegacyNamespaceDetailType;
  openModal: (namespace) => void;
}

export function LegacyNamespaceListItem({
  namespace,
  openModal,
}: LegacyNamespaceProps) {
  const {
    featureFlags: { ai_deny_index },
    user: { username, is_superuser },
  } = useContext();
  const { id, avatar_url, name, summary_fields } = namespace;

  const namespace_url = formatPath(Paths.legacyNamespace, {
    namespaceid: id,
  });

  const cells = [];

  cells.push(
    <DataListCell isFilled={false} alignRight={false} key='ns'>
      <Logo
        alt='logo'
        fallbackToDefault
        image={avatar_url}
        size='40px'
        unlockWidth
        width='97px'
      />
    </DataListCell>,
  );

  cells.push(
    <DataListCell key='content' size={10}>
      <div>
        <Link to={namespace_url}>{name}</Link>
      </div>
    </DataListCell>,
  );

  const userOwnsLegacyNamespace = !!summary_fields.owners.find(
    (n) => n.username == username,
  );

  const showWisdom = ai_deny_index && (is_superuser || userOwnsLegacyNamespace);

  const dropdownItems = [];

  dropdownItems.push(
    <DropdownItem
      onClick={() => openModal(namespace)}
    >{t`Ansible Lightspeed settings`}</DropdownItem>,
  );

  if (showWisdom) {
    cells.push(
      <DataListCell key='menu' alignRight={true}>
        <div style={{ float: 'right' }}>
          <StatefulDropdown items={dropdownItems} />
        </div>
      </DataListCell>,
    );
  }

  return (
    <DataListItem data-cy='LegacyNamespaceListItem'>
      <DataListItemRow>
        <DataListItemCells dataListCells={cells} />
      </DataListItemRow>
    </DataListItem>
  );
}
