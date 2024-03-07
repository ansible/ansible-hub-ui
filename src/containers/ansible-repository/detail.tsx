import { Trans, msg, t } from '@lingui/macro';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import React from 'react';
import { Navigate } from 'react-router-dom';
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
import { DistributionsTab } from './tab-distributions';
import { RepositoryVersionsTab } from './tab-repository-versions';

const AnsibleRepositoryDetail = PageWithTabs<
  AnsibleRepositoryType & { remote?: AnsibleRemoteType }
>({
  breadcrumbs: ({ name, tab, params: { repositoryVersion, user, group } }) =>
    [
      { url: formatPath(Paths.ansibleRepositories), name: t`Repositories` },
      { url: formatPath(Paths.ansibleRepositoryDetail, { name }), name },
      (tab === 'access' && (group || user)) ||
      (tab === 'repository-versions' && repositoryVersion)
        ? {
            url: formatPath(Paths.ansibleRepositoryDetail, { name }, { tab }),
            name: t`Versions`,
          }
        : null,
      tab === 'access' && group ? { name: t`Group ${group}` } : null,
      tab === 'access' && user ? { name: t`User ${user}` } : null,
      tab === 'repository-versions' && repositoryVersion
        ? { name: t`Version ${repositoryVersion}` }
        : null,
      (tab === 'access' && !user && !group) ||
      (tab === 'repository-versions' && !repositoryVersion)
        ? { name: t`Versions` }
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
      distributions: (
        <DistributionsTab item={item} actionContext={actionContext} />
      ),
      collections: (
        <Navigate
          to={formatPath(
            Paths.collections,
            {},
            { repository_name: item?.name },
          )}
        />
      ),
    })[tab],
  tabs: (tab, name) => [
    {
      active: tab === 'details',
      title: t`Details`,
      link: formatPath(
        Paths.ansibleRepositoryDetail,
        { name },
        { tab: 'details' },
      ),
    },
    {
      active: tab === 'access',
      title: t`Access`,
      link: formatPath(
        Paths.ansibleRepositoryDetail,
        { name },
        { tab: 'access' },
      ),
    },
    {
      active: tab === 'collection-versions',
      title: t`Collection versions`,
      link: formatPath(
        Paths.ansibleRepositoryDetail,
        { name },
        { tab: 'collection-versions' },
      ),
    },
    {
      active: tab === 'repository-versions',
      title: t`Versions`,
      link: formatPath(
        Paths.ansibleRepositoryDetail,
        { name },
        { tab: 'repository-versions' },
      ),
    },
    {
      active: tab === 'distributions',
      title: t`Distributions`,
      link: formatPath(
        Paths.ansibleRepositoryDetail,
        { name },
        { tab: 'distributions' },
      ),
    },
    {
      active: tab === 'collections',
      title: t`Collections`,
      icon: <ArrowRightIcon />,
      link: formatPath(
        Paths.ansibleRepositoryDetail,
        { name },
        { tab: 'collections' },
      ),
    },
  ],
});

export default AnsibleRepositoryDetail;
