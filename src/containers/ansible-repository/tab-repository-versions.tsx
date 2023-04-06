import { t } from '@lingui/macro';
import { Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ansibleRepositoryVersionRevertAction } from 'src/actions';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  AnsibleRepositoryVersionType,
  PulpAPI,
} from 'src/api';
import {
  DateComponent,
  DetailList,
  Details,
  ListItemActions,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { parsePulpIDFromURL } from 'src/utilities';

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: {
    addAlert: (alert) => void;
    state: { params };
    hasPermission: (string) => boolean;
    hasObjectPermission: (string) => boolean;
  };
}

const AnyAPI = (href) =>
  new (class extends PulpAPI {
    useOrdering = true;
    apiPath = href.replace(PULP_API_BASE_PATH, '');
  })();

const VersionContent = ({
  href,
  addAlert,
  hasPermission,
  repositoryName,
}: {
  href: string;
  addAlert: (alert) => void;
  hasPermission: (string) => boolean;
  repositoryName: string;
}) => {
  const [state, setState] = useState({});
  if (!href) {
    return null;
  }

  const API = AnyAPI(href);
  const query = ({ params }) => API.list(params);
  const renderTableRow = ({
    manifest: {
      collection_info: { namespace, name, version },
    },
    description,
  }) => (
    <tr>
      <td>
        <Link
          to={formatPath(
            Paths.collectionByRepo,
            {
              repo: repositoryName,
              namespace,
              collection: name,
            },
            {
              version,
            },
          )}
        >
          {namespace}.{name} v{version}
        </Link>
      </td>
      <td>{description}</td>
    </tr>
  );

  return (
    <DetailList<{ manifest; description; pulp_href }>
      actionContext={{
        addAlert,
        state,
        setState,
        query,
        hasPermission,
      }}
      defaultPageSize={10}
      defaultSort={'name'}
      errorTitle={t`Collection versions could not be displayed.`}
      noDataDescription={t`No collection versions in this repository version.`}
      noDataTitle={t`No collection versions yet`}
      query={query}
      renderTableRow={renderTableRow}
      sortHeaders={[
        {
          title: t`Collection`,
          type: 'none',
          id: 'col1',
        },
        {
          title: t`Description`,
          type: 'none',
          id: 'col2',
        },
      ]}
      title={t`Collection versions`}
    />
  );
};

const ContentSummary = ({ data }: { data: object }) => {
  if (!Object.keys(data).length) {
    return <>{t`None`}</>;
  }

  return (
    <table className='pf-c-table'>
      <tr>
        <th>{t`Count`}</th>
        <th>{t`Pulp type`}</th>
      </tr>
      {Object.entries(data).map(([k, v]) => (
        <tr key={k}>
          <td>{v['count']}</td>
          <th>{k}</th>
        </tr>
      ))}
    </table>
  );
};

const BaseVersion = ({
  repositoryName,
  data,
}: {
  repositoryName: string;
  data?: string;
}) => {
  if (!data) {
    return <>{t`None`}</>;
  }

  const number = data.split('/').at(-2);
  return (
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
  );
};

export const RepositoryVersionsTab = ({
  item,
  actionContext: { addAlert, state, hasPermission, hasObjectPermission },
}: TabProps) => {
  const pulpId = parsePulpIDFromURL(item.pulp_href);
  const latest_href = item.latest_version_href;
  const repositoryName = item.name;
  const queryList = ({ params }) =>
    AnsibleRepositoryAPI.listVersions(pulpId, params);
  const queryDetail = ({ number }) =>
    AnsibleRepositoryAPI.listVersions(pulpId, { number });
  const [modalState, setModalState] = useState({});
  const [version, setVersion] = useState(null);

  useEffect(() => {
    if (state.params.repositoryVersion) {
      queryDetail({ number: state.params.repositoryVersion }).then(
        ({ data }) => {
          if (!data?.results?.[0]) {
            addAlert({
              variant: 'danger',
              title: t`Failed to find repository version`,
            });
          }
          setVersion(data.results[0]);
        },
      );
    } else {
      setVersion(null);
    }
  }, [state.params.repositoryVersion]);

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
    version ? (
      <>
        <Details
          fields={[
            { label: t`Version number`, value: version.number },
            {
              label: t`Created date`,
              value: <DateComponent date={version.pulp_created} />,
            },
            {
              label: t`Content added`,
              value: <ContentSummary data={version.content_summary?.added} />,
            },
            {
              label: t`Content removed`,
              value: <ContentSummary data={version.content_summary?.removed} />,
            },
            {
              label: t`Current content`,
              value: <ContentSummary data={version.content_summary?.present} />,
            },
            {
              label: t`Base version`,
              value: (
                <BaseVersion
                  repositoryName={repositoryName}
                  data={version.base_version}
                />
              ),
            },
          ]}
        />
        <div
          className='pf-c-page__main-section'
          style={{ padding: '8px 0', margin: '24px -16px 0' }}
        />
        <VersionContent
          {...version.content_summary.present['ansible.collection_version']}
          repositoryName={repositoryName}
        />
      </>
    ) : (
      <Spinner size='md' />
    )
  ) : (
    <DetailList<AnsibleRepositoryVersionType>
      actionContext={{
        addAlert,
        state: modalState,
        setState: setModalState,
        query: queryList,
        hasPermission,
        hasObjectPermission, // needs item=repository, not repository version
      }}
      defaultPageSize={10}
      defaultSort={'-pulp_created'}
      errorTitle={t`Repository versions could not be displayed.`}
      filterConfig={null}
      listItemActions={[ansibleRepositoryVersionRevertAction]}
      noDataButton={null}
      noDataDescription={t`Repository versions will appear once the repository is modified.`}
      noDataTitle={t`No repository versions yet`}
      query={queryList}
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
