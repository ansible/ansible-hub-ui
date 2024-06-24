import { Trans, t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { type LegacyRoleDetailType } from 'src/api';
import {
  DateComponent,
  DownloadCount,
  LabelGroup,
  Logo,
  ProviderLink,
  Tag,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { roleNamespaceInfo } from 'src/utilities';
import './list-item.scss';

interface RoleProps {
  role: LegacyRoleDetailType;
  show_thumbnail?: boolean;
}

export function RoleItem({ role, show_thumbnail }: RoleProps) {
  const {
    description,
    modified,
    name,
    summary_fields: { namespace, versions, tags },
  } = role;
  const latest = versions[0];

  const role_url = formatPath(Paths.standaloneRole, {
    namespace: namespace.name,
    name,
  });
  const release_date = latest?.release_date || modified;
  const release_name = latest?.name || '';
  const provider = roleNamespaceInfo(role);
  const cells = [];

  if (show_thumbnail) {
    cells.push(
      <DataListCell isFilled={false} key='ns'>
        <Logo
          alt={t`${namespace.name} logo`}
          image={namespace.avatar_url}
          size='70px'
          unlockWidth
          width='97px'
        />
      </DataListCell>,
    );
  }

  cells.push(
    <DataListCell key='content'>
      <div>
        <Link to={role_url}>
          {namespace.name}.{name}
        </Link>
        <ProviderLink {...provider} />
      </div>
      <div className='hub-entry'>{description}</div>
      <div className='hub-entry'>
        <LabelGroup>
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </LabelGroup>
      </div>
    </DataListCell>,
  );

  cells.push(
    <DataListCell isFilled={false} alignRight key='stats'>
      <div className='hub-right-col hub-entry'>
        <Trans>
          Updated <DateComponent date={release_date} />
        </Trans>
      </div>
      <div className='hub-entry'>{release_name}</div>
      <div className='hub-entry'>
        <DownloadCount item={role} />
      </div>
    </DataListCell>,
  );

  return (
    <DataListItem data-cy='RoleItem'>
      <DataListItemRow>
        <DataListItemCells dataListCells={cells} />
      </DataListItemRow>
    </DataListItem>
  );
}
