import { Trans, t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  CollectionVersionAPI,
} from 'src/api';
import {
  Details,
  LazyDistributions,
  PageWithTabs,
  PulpLabels,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';
import {
  handleHttpError,
  lastSyncStatus,
  lastSynced,
  parsePulpIDFromURL,
} from 'src/utilities';

const wip = '🚧 ';

const tabs = [
  { id: 'details', name: t`Details` },
  { id: 'access', name: wip + t`Access` },
  { id: 'collection-versions', name: wip + t`Collection versions` },
  { id: 'repository-versions', name: wip + t`Versions` },
];

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: { addAlert: (alert) => void };
}

const DetailsTab = ({ item }: TabProps) => {
  const [remote, setRemote] = useState<AnsibleRemoteType>(null);

  useEffect(() => {
    const pk = item.remote && parsePulpIDFromURL(item.remote);
    if (pk) {
      AnsibleRemoteAPI.get(pk).then(({ data }) => setRemote(data));
    } else {
      setRemote(null);
    }
  }, [item.remote]);

  return (
    <Details
      fields={[
        { label: t`Repository name`, value: item?.name },
        { label: t`Description`, value: item?.description || t`None` },
        {
          label: t`Retained version count`,
          value: item?.retain_repo_versions ?? t`None`,
        },
        {
          label: t`Distribution`,
          value: <LazyDistributions repositoryHref={item.pulp_href} />,
        },
        {
          label: t`Labels`,
          value: <PulpLabels labels={item?.pulp_labels} />,
        },
        {
          label: t`Remote`,
          value: remote ? (
            <Link
              to={formatPath(Paths.ansibleRemoteDetail, { name: remote.name })}
            >
              {remote.name}
            </Link>
          ) : (
            t`None`
          ),
        },
      ]}
    />
  );
};

const AccessTab = ({ item }: TabProps) => <Details item={item} />;

const CollectionVersionsTab = ({
  item,
  actionContext: { addAlert },
}: TabProps) => {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    CollectionVersionAPI.list({ repository: item.name })
      .then(({ data: { data } }) => setVersions(data))
      .catch(
        handleHttpError(
          t`Failed to load collection versions`,
          () => setVersions([]),
          addAlert,
        ),
      );
  }, []);

  return <Details item={versions} />;
};

const RepositoryVersionsTab = ({
  item,
  actionContext: { addAlert },
}: TabProps) => {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    const pulpId = parsePulpIDFromURL(item.pulp_href);
    AnsibleRepositoryAPI.listVersions(pulpId)
      .then(({ data: { results } }) => setVersions(results))
      .catch(
        handleHttpError(
          t`Failed to load repository versions`,
          () => setVersions([]),
          addAlert,
        ),
      );
  }, []);

  return <Details item={versions} />;
};

export const AnsibleRepositoryDetail = PageWithTabs<AnsibleRepositoryType>({
  breadcrumbs: ({ name, tab }) => [
    { url: formatPath(Paths.ansibleRepositories), name: t`Repositories` },
    { url: formatPath(Paths.ansibleRepositoryDetail, { name }), name },
    { name: tab.name },
  ],
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
      access: <AccessTab item={item} actionContext={actionContext} />,
      'collection-versions': (
        <CollectionVersionsTab item={item} actionContext={actionContext} />
      ),
      'repository-versions': (
        <RepositoryVersionsTab item={item} actionContext={actionContext} />
      ),
    }[tab]),
  tabs,
});

export default AnsibleRepositoryDetail;
