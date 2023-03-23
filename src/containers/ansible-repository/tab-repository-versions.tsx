import { t } from '@lingui/macro';
import { Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ansibleRepositoryVersionRevertAction } from 'src/actions';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  AnsibleRepositoryVersionType,
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
  actionContext: { addAlert: (alert) => void; state: { params } };
}

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
  actionContext: { addAlert, state },
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
