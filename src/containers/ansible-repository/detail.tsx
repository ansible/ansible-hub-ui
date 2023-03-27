import { Trans, t } from '@lingui/macro';
import React from 'react';
import {
  ansibleRepositoryCopyAction,
  ansibleRepositoryDeleteAction,
  ansibleRepositoryEditAction,
  ansibleRepositorySyncAction,
} from 'src/actions';
import { AnsibleRepositoryAPI, AnsibleRepositoryType } from 'src/api';
import { PageWithTabs } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';
import { lastSyncStatus, lastSynced } from 'src/utilities';
import { RepositoryAccessTab } from './tab-access';
import { CollectionVersionsTab } from './tab-collection-versions';
import { DetailsTab } from './tab-details';
import { RepositoryVersionsTab } from './tab-repository-versions';

const wip = '🚧 ';

const tabs = [
  { id: 'details', name: t`Details` },
  { id: 'access', name: t`Access` },
  { id: 'collection-versions', name: wip + t`Collection versions` },
  { id: 'repository-versions', name: t`Versions` },
];

export const AnsibleRepositoryDetail = PageWithTabs<AnsibleRepositoryType>({
  breadcrumbs: ({ name, tab, params: { repositoryVersion, group } }) =>
    [
      { url: formatPath(Paths.ansibleRepositories), name: t`Repositories` },
      { url: formatPath(Paths.ansibleRepositoryDetail, { name }), name },
      (tab.id === 'repository-versions' && repositoryVersion) ||
      (tab.id === 'access' && group)
        ? {
            url: formatPath(
              Paths.ansibleRepositoryDetail,
              { name },
              { tab: tab.id },
            ),
            name: tab.name,
          }
        : null,
      tab.id === 'repository-versions' && repositoryVersion
        ? { name: t`Version ${repositoryVersion}` }
        : tab.id === 'access' && group
        ? { name: t`Group ${group}` }
        : { name: tab.name },
    ].filter(Boolean),
  condition: isLoggedIn,
  displayName: 'AnsibleRepositoryDetail',
  errorTitle: t`Repository could not be displayed.`,
  headerActions: [
    ansibleRepositoryEditAction,
    ansibleRepositorySyncAction,
    ansibleRepositoryCopyAction,
    ansibleRepositoryDeleteAction,
  ],
  headerDetails: (item) => (
    <>
      {item?.last_sync_task && (
        <p className='hub-m-truncated'>
          <Trans>Last updated from registry {lastSynced(item)}</Trans>{' '}
          {lastSyncStatus(item)}
        </p>
      )}
    </>
  ),
  query: ({ name }) =>
    AnsibleRepositoryAPI.list({ name }).then(
      ({ data: { results } }) => results[0],
    ),
  renderTab: (tab, item, actionContext) =>
    ({
      details: <DetailsTab item={item} actionContext={actionContext} />,
      access: <RepositoryAccessTab item={item} actionContext={actionContext} />,
      'collection-versions': (
        <CollectionVersionsTab item={item} actionContext={actionContext} />
      ),
      'repository-versions': (
        <RepositoryVersionsTab item={item} actionContext={actionContext} />
      ),
    }[tab]),
  tabs,
  tabUpdateParams: (p) => {
    delete p.repositoryVersion;
    delete p.group;
    return p;
  },
});

export default AnsibleRepositoryDetail;
