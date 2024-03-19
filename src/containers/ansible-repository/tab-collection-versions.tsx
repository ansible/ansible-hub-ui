import { t } from '@lingui/macro';
import { Td, Tr } from '@patternfly/react-table';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ansibleRepositoryCollectionVersionAddAction,
  ansibleRepositoryCollectionVersionRemoveAction,
} from 'src/actions';
import {
  type AnsibleRepositoryType,
  CollectionVersionAPI,
  type CollectionVersionSearch,
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
  // @ts-expect-error: TS2525: Initializer provides no value for this binding element and the binding element has no default value.
  const query = ({ params } = {}) => {
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

  const [modalState, setModalState] = useState({ repository: item });
  useEffect(() => setModalState((ms) => ({ ...ms, repository: item })), [item]);

  const renderTableRow = (
    item: CollectionVersionSearch,
    index: number,
    actionContext,
    listItemActions,
  ) => {
    const {
      collection_version: { name, namespace, version, description },
      repository,
    } = item;

    const kebabItems = listItemActions.map((action) =>
      action.dropdownItem(item, actionContext),
    );

    return (
      <Tr key={index}>
        <Td>
          <Link
            to={formatPath(
              Paths.collectionByRepo,
              {
                repo: repository.name,
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
        </Td>
        <Td>{description}</Td>
        <ListItemActions kebabItems={kebabItems} />
      </Tr>
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
        hasObjectPermission: (p: string): boolean =>
          item?.my_permissions?.includes?.(p),
      }}
      defaultPageSize={10}
      defaultSort={'name'}
      errorTitle={t`Collection versions could not be displayed.`}
      filterConfig={[
        {
          id: 'keywords',
          title: t`Keywords`,
        },
        {
          id: 'namespace',
          title: t`Namespace`,
        },
      ]}
      headerActions={[ansibleRepositoryCollectionVersionAddAction]}
      listItemActions={[ansibleRepositoryCollectionVersionRemoveAction]}
      noDataButton={ansibleRepositoryCollectionVersionAddAction.button}
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
