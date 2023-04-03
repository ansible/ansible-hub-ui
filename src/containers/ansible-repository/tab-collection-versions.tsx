import { t } from '@lingui/macro';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ansibleRepositoryCollectionVersionRemoveAction } from 'src/actions';
import {
  AnsibleRepositoryType,
  CollectionVersionAPI,
  CollectionVersionSearch,
} from 'src/api';
import { DetailList, ListItemActions } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { parsePulpIDFromURL } from 'src/utilities';

interface TabProps {
  item: AnsibleRepositoryType;
  actionContext: {
    addAlert: (alert) => void;
    state: { params };
    hasPermission;
  };
}

export const CollectionVersionsTab = ({
  item,
  actionContext: { addAlert, hasPermission },
}: TabProps) => {
  const query = ({ params }) => {
    const newParams = { ...params };
    newParams.ordering = newParams.sort;
    delete newParams.sort;

    const repository = parsePulpIDFromURL(item.pulp_href);
    return CollectionVersionAPI.list({
      repository,
      ...newParams,
    }).then(
      ({
        data: {
          meta: { count },
          data: results,
        },
      }) => ({
        data: { count, results },
      }),
    );
  };

  const [modalState, setModalState] = useState({});

  const renderTableRow = (
    item: CollectionVersionSearch,
    index: number,
    actionContext,
    listItemActions,
  ) => {
    const {
      collection_version: { name, namespace, version, description },
    } = item;

    const kebabItems = listItemActions.map((action) =>
      action.dropdownItem(item, actionContext),
    );

    return (
      <tr key={index}>
        <td>
          <Link
            to={formatPath(
              Paths.collection,
              {
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
        <ListItemActions kebabItems={kebabItems} />
      </tr>
    );
  };

  return (
    <DetailList<CollectionVersionSearch>
      actionContext={{
        addAlert,
        state: modalState,
        setState: setModalState,
        query,
        hasPermission,
      }}
      defaultPageSize={10}
      defaultSort={'name'}
      errorTitle={t`Collection versions could not be displayed.`}
      filterConfig={null}
      listItemActions={[ansibleRepositoryCollectionVersionRemoveAction]}
      noDataButton={null}
      noDataDescription={t`Collection versions will appear once the collection is modified.`}
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
