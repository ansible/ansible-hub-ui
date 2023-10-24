import { Trans, t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { LegacyRoleDetailType } from 'src/api';
import {
  DateComponent,
  DownloadCount,
  LabelGroup,
  Logo,
  ProviderLink,
  RoleRatings,
  Tag,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { getProviderInfo } from 'src/utilities';
import './legacy-role-item.scss';

interface LegacyRoleProps {
  role: LegacyRoleDetailType;
  show_thumbnail: boolean;
}

export function LegacyRoleListItem({ role, show_thumbnail }: LegacyRoleProps) {
  const {
    description,
    modified,
    name,
    summary_fields: { namespace, versions, tags },
  } = role;
  const latest = versions[0];

  const role_url = formatPath(Paths.legacyRole, {
    username: namespace.name,
    name,
  });
  const release_date = latest?.release_date || modified;
  const release_name = latest?.name || '';
  const provider = getProviderInfo(role);
  const cells = [];

  if (show_thumbnail !== false) {
    cells.push(
      <DataListCell isFilled={false} alignRight={false} key='ns'>
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
        <RoleRatings namespace={namespace.name} name={name} />
        <DownloadCount item={role} />
      </div>
    </DataListCell>,
  );

  return (
    <DataListItem data-cy='LegacyRoleListItem'>
      <DataListItemRow>
        <DataListItemCells dataListCells={cells} />
      </DataListItemRow>
    </DataListItem>
  );
}
