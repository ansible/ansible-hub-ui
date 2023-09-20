import { Trans, msg, t } from '@lingui/macro';
import React from 'react';
import {
  ansibleRepositoryCopyAction,
  ansibleRepositoryDeleteAction,
  ansibleRepositoryEditAction,
  ansibleRepositorySyncAction,
} from 'src/actions';
import {
  AnsibleRemoteAPI,
  AnsibleRemoteType,
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
} from 'src/api';
import { PageWithTabs } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canViewAnsibleRepositories } from 'src/permissions';
import { parsePulpIDFromURL, repositoryBasePath } from 'src/utilities';
import { lastSyncStatus, lastSynced } from 'src/utilities';
import { RepositoryAccessTab } from './tab-access';
import { CollectionVersionsTab } from './tab-collection-versions';
import { DetailsTab } from './tab-details';
import { RepositoryVersionsTab } from './tab-repository-versions';

const tabs = [
  { id: 'details', name: msg`Details` },
  { id: 'access', name: msg`Access` },
  { id: 'collection-versions', name: msg`Collection versions` },
  { id: 'repository-versions', name: msg`Versions` },
];

const AnsibleRepositoryDetail = PageWithTabs<
  AnsibleRepositoryType & { remote?: AnsibleRemoteType }
>({
  breadcrumbs: ({ name, tab, params: { repositoryVersion, user, group } }) =>
    [
      { url: formatPath(Paths.ansibleRepositories), name: t`Repositories` },
      { url: formatPath(Paths.ansibleRepositoryDetail, { name }), name },
      (tab.id === 'access' && (group || user)) ||
      (tab.id === 'repository-versions' && repositoryVersion)
        ? {
            url: formatPath(
              Paths.ansibleRepositoryDetail,
              { name },
              { tab: tab.id },
            ),
            name: tab.name,
          }
        : null,
      tab.id === 'access' && group ? { name: t`Group ${group}` } : null,
      tab.id === 'access' && user ? { name: t`User ${user}` } : null,
      tab.id === 'repository-versions' && repositoryVersion
        ? { name: t`Version ${repositoryVersion}` }
        : null,
      (tab.id === 'access' && !user && !group) ||
      (tab.id === 'repository-versions' && !repositoryVersion)
        ? { name: tab.name }
        : null,
    ].filter(Boolean),
  condition: canViewAnsibleRepositories,
  displayName: 'AnsibleRepositoryDetail',
  errorTitle: msg`Repository could not be displayed.`,
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
  listUrl: formatPath(Paths.ansibleRepositories),
  query: ({ name }) => {
    return AnsibleRepositoryAPI.list({ name, page_size: 1 })
      .then(({ data: { results } }) => results[0])
      .then((repository) => {
        // using the list api, so an empty array is really a 404
        if (!repository) {
          return Promise.reject({ response: { status: 404 } });
        }

        const err = (val) => (e) => {
          console.error(e);
          return val;
        };

        return Promise.all([
          repositoryBasePath(repository.name, repository.pulp_href).catch(
            err(null),
          ),
          AnsibleRepositoryAPI.myPermissions(
            parsePulpIDFromURL(repository.pulp_href),
          )
            .then(({ data: { permissions } }) => permissions)
            .catch(err([])),
          repository.remote
            ? AnsibleRemoteAPI.get(parsePulpIDFromURL(repository.remote))
                .then(({ data }) => data)
                .catch(() => null)
            : null,
        ]).then(([distroBasePath, my_permissions, remote]) => ({
          ...repository,
          distroBasePath,
          my_permissions,
          remote,
        }));
      });
  },
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
    })[tab],
  tabs,
  tabUpdateParams: (p) => {
    delete p.repositoryVersion;
    delete p.group;
    delete p.user;
    return p;
  },
});

export default AnsibleRepositoryDetail;
