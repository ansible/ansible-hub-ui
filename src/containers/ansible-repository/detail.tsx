import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import {
  ansibleRepositoryCopyAction,
  ansibleRepositoryDeleteAction,
  ansibleRepositoryEditAction,
  ansibleRepositorySyncAction,
} from 'src/actions';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  CollectionVersionAPI,
} from 'src/api';
import { Details, PageWithTabs } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { isLoggedIn } from 'src/permissions';
import { handleHttpError, parsePulpIDFromURL } from 'src/utilities';

const wip = '🚧 ';

const tabs = [
  { id: 'details', name: t`Details` },
  { id: 'access', name: wip + t`Access` },
  { id: 'collection-versions', name: wip + t`Collection versions` },
  { id: 'repository-versions', name: wip + t`Versions` },
];

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: any;
}

const DetailsTab = ({ item, actionContext }: TabProps) => (
  <Details
    item={item}
    fields={[
      { label: t`Repository name`, value: item?.name },
      { label: t`Description`, value: item?.description },
      {
        label: t`Retained version count`,
        value: item?.retain_repo_versions,
      },
      { label: wip + t`Repository type`, value: 'TODO' }, // TODO by .remote?
      { label: wip + t`Distribution`, value: 'TODO' }, // TODO hide?
      {
        label: wip + t`Labels`,
        value: JSON.stringify(item?.pulp_labels, null, 2),
      }, //TODO
      {
        label: wip + t`Remote`,
        value: JSON.stringify(item?.remote, null, 2),
      }, //TODO
    ]}
  />
);

const AccessTab = ({ item, actionContext }: TabProps) => (
  <Details item={item} />
);

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
