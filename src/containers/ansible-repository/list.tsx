import { t } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ansibleRepositoryCopyAction,
  ansibleRepositoryCreateAction,
  ansibleRepositoryDeleteAction,
  ansibleRepositoryEditAction,
  ansibleRepositorySyncAction,
} from 'src/actions';
import { AnsibleRepositoryAPI, AnsibleRepositoryType } from 'src/api';
import { DateComponent, ListItemActions, ListPage } from 'src/components';
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

const AnsibleRepositoryList = ListPage<AnsibleRepositoryType>({
  condition: canViewAnsibleRepositories,
  defaultPageSize: 10,
  defaultSort: '-pulp_created',
  displayName: 'AnsibleRepositoryList',
  errorTitle: t`Repositories could not be displayed.`,
  extraState: {},
  filterConfig: [
    {
      id: 'name__icontains',
      title: t`Repository name`,
    },
  ],
  headerActions: [ansibleRepositoryCreateAction], // Add repository
  listItemActions,
  noDataButton: ansibleRepositoryCreateAction.button,
  noDataDescription: t`Repositories will appear once created.`,
  noDataTitle: t`No repositories yet`,
  query: ({ params }) => AnsibleRepositoryAPI.list(params),
  renderTableRow(item: AnsibleRepositoryType, index: number, actionContext) {
    const { name, pulp_created, pulp_href } = item;
    const id = parsePulpIDFromURL(pulp_href);

    const kebabItems = listItemActions.map((action) =>
      action.dropdownItem({ ...item, id }, actionContext),
    );

    return (
      <tr key={index}>
        <td>
          <Link to={formatPath(Paths.ansibleRepositoryDetail, { name })}>
            {name}
          </Link>
        </td>
        <td>{lastSyncStatus(item) || '---'}</td>
        <td>{lastSynced(item) || '---'}</td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <ListItemActions kebabItems={kebabItems} />
      </tr>
    );
  },
  sortHeaders: [
    {
      title: t`Repository name`,
      type: 'alpha',
      id: 'name',
    },
    {
      title: t`Sync status`,
      type: 'none',
      id: 'lastSyncStatus',
    },
    {
      title: t`Last synced`,
      type: 'none',
      id: 'lastSynced',
    },
    {
      title: t`Created date`,
      type: 'numeric',
      id: 'pulp_created',
    },
  ],
  title: t`Repositories`,
});

export default AnsibleRepositoryList;
