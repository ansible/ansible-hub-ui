import { t } from '@lingui/macro';
import React, { useState } from 'react';
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

export const RepositoryVersionsTab = ({
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
