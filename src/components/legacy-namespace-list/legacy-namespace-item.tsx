import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { LegacyNamespaceDetailType } from 'src/api';
import { Logo } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import './legacy-namespace-item.scss';

interface LegacyNamespaceProps {
  namespace: LegacyNamespaceDetailType;
}

export function LegacyNamespaceListItem({ namespace }: LegacyNamespaceProps) {
  const { id, avatar_url, name } = namespace;

  const namespace_url = formatPath(Paths.standaloneNamespace, {
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

  return (
    <DataListItem data-cy='LegacyNamespaceListItem'>
      <DataListItemRow>
        <DataListItemCells dataListCells={cells} />
      </DataListItemRow>
    </DataListItem>
  );
}
