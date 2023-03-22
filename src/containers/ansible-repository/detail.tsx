import { Trans, t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ansibleRepositoryCopyAction,
  ansibleRepositoryDeleteAction,
  ansibleRepositoryEditAction,
  ansibleRepositorySyncAction,
  ansibleRepositoryVersionRevertAction,
} from 'src/actions';
import {
  AnsibleRemoteAPI,
  AnsibleRemoteType,
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  AnsibleRepositoryVersionType,
  CollectionVersionAPI,
} from 'src/api';
import {
  DateComponent,
  DetailList,
  Details,
  LazyDistributions,
  ListItemActions,
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
  { id: 'repository-versions', name: t`Versions` },
];

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: { addAlert: (alert) => void; state: { params } };
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
          value: item?.retain_repo_versions ?? t`All`,
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
  actionContext: { addAlert, state },
}: TabProps) => {
  const pulpId = parsePulpIDFromURL(item.pulp_href);
  const latest_href = item.latest_version_href;
  const repositoryName = item.name;
  const query = ({ params }) =>
    AnsibleRepositoryAPI.listVersions(pulpId, params);
  const [modalState, setModalState] = useState({});

  const renderTableRow = (
    item: AnsibleRepositoryVersionType,
    index: number,
    actionContext,
    listItemActions,
  ) => {
    const { number, pulp_created, pulp_href } = item;

    const isLatest = latest_href === pulp_href;

    const kebabItems = listItemActions.map((action) =>
      action.dropdownItem({ ...item, isLatest, repositoryName }, actionContext),
    );

    return (
      <tr key={index}>
        <td>
          <Link
            to={formatPath(
              Paths.ansibleRepositoryDetail,
              {
                name: repositoryName,
              },
              {
                repositoryVersion: number,
                tab: 'repository-versions',
              },
            )}
          >
            {number}
          </Link>
          {isLatest ? ' ' + t`(latest)` : null}
        </td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <ListItemActions kebabItems={kebabItems} />
      </tr>
    );
  };

  return state.params.repositoryVersion ? (
    <Details fields={[{ label: t`Foo`, value: t`Bar` }]} />
  ) : (
    <DetailList<AnsibleRepositoryVersionType>
      actionContext={{
        addAlert,
        state: modalState,
        setState: setModalState,
        query,
      }}
      defaultPageSize={10}
      defaultSort={'-pulp_created'}
      errorTitle={t`Repository versions could not be displayed.`}
      filterConfig={null}
      listItemActions={[ansibleRepositoryVersionRevertAction]}
      noDataButton={null}
      noDataDescription={t`Repository versions will appear once the repository is modified.`}
      noDataTitle={t`No repository versions yet`}
      query={query}
      renderTableRow={renderTableRow}
      sortHeaders={[
        {
          title: t`Version number`,
          type: 'numeric',
          id: 'number',
        },
        {
          title: t`Created date`,
          type: 'numeric',
          id: 'pulp_created',
        },
      ]}
      title={t`Repository versions`}
    />
  );
};

export const AnsibleRepositoryDetail = PageWithTabs<AnsibleRepositoryType>({
  breadcrumbs: ({ name, tab, params: { repositoryVersion } }) =>
    [
      { url: formatPath(Paths.ansibleRepositories), name: t`Repositories` },
      { url: formatPath(Paths.ansibleRepositoryDetail, { name }), name },
      tab.id === 'repository-versions' && repositoryVersion
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
      access: <AccessTab item={item} actionContext={actionContext} />,
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
    return p;
  },
});

export default AnsibleRepositoryDetail;
