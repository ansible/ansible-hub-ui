import { msg, t } from '@lingui/macro';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ansibleRepositoryCopyAction,
  ansibleRepositoryCreateAction,
  ansibleRepositoryDeleteAction,
  ansibleRepositoryEditAction,
  ansibleRepositorySyncAction,
} from 'src/actions';
import {
  AnsibleRemoteAPI,
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
} from 'src/api';
import {
  DateComponent,
  ListItemActions,
  ListPage,
  PulpLabels,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canViewAnsibleRepositories } from 'src/permissions';
import { lastSyncStatus, lastSynced, parsePulpIDFromURL } from 'src/utilities';

const listItemActions = [
  // Edit
  ansibleRepositoryEditAction,
  // Sync
  ansibleRepositorySyncAction,
  // Copy CLI configuration
  ansibleRepositoryCopyAction,
  // Delete
  ansibleRepositoryDeleteAction,
];

const typeaheadQuery = ({ inputText, selectedFilter, setState }) => {
  if (selectedFilter !== 'remote') {
    return;
  }

  return AnsibleRemoteAPI.list({ name__icontains: inputText })
    .then(({ data: { results } }) =>
      results.map(({ name, pulp_href }) => ({ id: pulp_href, title: name })),
    )
    .then((remotes) => setState({ remotes }));
};

const AnsibleRepositoryList = ListPage<AnsibleRepositoryType>({
  condition: canViewAnsibleRepositories,
  defaultPageSize: 10,
  defaultSort: '-pulp_created',
  displayName: 'AnsibleRepositoryList',
  errorTitle: msg`Repositories could not be displayed.`,
  filterConfig: ({ state: { remotes } }) => [
    {
      id: 'name__icontains',
      title: t`Repository name`,
    },
    {
      id: 'pulp_label_select',
      title: t`Pipeline`,
      inputType: 'select',
      options: [
        {
          id: 'pipeline=rejected',
          title: t`Rejected`,
        },
        {
          id: 'pipeline=staging',
          title: t`Needs Review`,
        },
        {
          id: 'pipeline=approved',
          title: t`Approved`,
        },
      ],
    },
    {
      id: 'remote',
      title: t`Remote`,
      inputType: 'typeahead',
      options: [
        {
          id: 'null',
          title: t`None`,
        },
        ...(remotes || []),
      ],
    },
  ],
  headerActions: [ansibleRepositoryCreateAction], // Add repository
  listItemActions,
  noDataButton: ansibleRepositoryCreateAction.button,
  noDataDescription: msg`Repositories will appear once created.`,
  noDataTitle: msg`No repositories yet`,
  query: ({ params }) => AnsibleRepositoryAPI.list(params),
  typeaheadQuery,
  renderTableRow(item: AnsibleRepositoryType, index: number, actionContext) {
    const {
      last_sync_task,
      name,
      private: isPrivate,
      pulp_created,
      pulp_href,
      pulp_labels,
      remote,
    } = item;
    const id = parsePulpIDFromURL(pulp_href);

    const kebabItems = listItemActions.map((action) =>
      action.dropdownItem({ ...item, id }, actionContext),
    );

    return (
      <Tr key={index}>
        <Td>
          <Link to={formatPath(Paths.ansibleRepositoryDetail, { name })}>
            {name}
          </Link>
        </Td>
        <Td>
          <PulpLabels labels={pulp_labels} />
        </Td>
        <Td>{isPrivate ? t`Yes` : t`No`}</Td>
        <Td>
          {!remote ? (
            t`no remote`
          ) : !last_sync_task ? (
            t`never synced`
          ) : (
            <>
              {lastSyncStatus(item)} {lastSynced(item)}
            </>
          )}
        </Td>
        <Td>
          <DateComponent date={pulp_created} />
        </Td>
        <ListItemActions kebabItems={kebabItems} />
      </Tr>
    );
  },
  sortHeaders: [
    {
      title: msg`Repository name`,
      type: 'alpha',
      id: 'name',
    },
    {
      title: msg`Labels`,
      type: 'none',
      id: 'pulp_labels',
    },
    {
      title: msg`Private`,
      type: 'none',
      id: 'private',
    },
    {
      title: msg`Sync status`,
      type: 'none',
      id: 'last_sync_task',
    },
    {
      title: msg`Created date`,
      type: 'numeric',
      id: 'pulp_created',
    },
  ],
  title: msg`Repositories`,
});

export default AnsibleRepositoryList;
