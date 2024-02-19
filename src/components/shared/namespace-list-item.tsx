import { t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { namespaceTitle } from 'src/utilities';

export function NamespaceListItem({
  namespace,
}: {
  namespace: { avatar_url: string; company: string; name: string };
}) {
  const { avatar_url, name } = namespace;
  const namespace_url = formatPath(Paths.namespaceDetail, {
    namespace: name,
  });
  const title = namespaceTitle(namespace);

  return (
    <DataListItem data-cy='NamespaceListItem'>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell isFilled={false} key='ns'>
              <Logo
                alt={t`${title} logo`}
                fallbackToDefault
                image={avatar_url}
                size='40px'
                unlockWidth
                width='97px'
              />
            </DataListCell>,
            <DataListCell key='content' size={10}>
              <div>
                <Link to={namespace_url}>{title}</Link>
              </div>
            </DataListCell>,
            title !== name ? (
              <DataListCell key='content' size={5}>
                <div>{name}</div>
              </DataListCell>
            ) : null,
          ].filter(Boolean)}
        />
      </DataListItemRow>
    </DataListItem>
  );
}
