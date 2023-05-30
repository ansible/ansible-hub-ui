import { msg } from '@lingui/macro';
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
import { Constants } from 'src/constants';
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
  errorTitle: msg`Repositories could not be displayed.`,
  extraState: {},
  filterConfig: [
    {
      id: 'name__icontains',
      title: msg`Repository name`,
    },
    {
      id: 'status',
      title: msg`Status`,
      inputType: 'select',
      options: [
        {
          id: Constants.NOTCERTIFIED,
          title: msg`Rejected`,
        },
        {
          id: Constants.NEEDSREVIEW,
          title: msg`Needs Review`,
        },
        {
          id: Constants.APPROVED,
          title: msg`Approved`,
        },
      ],
    },
  ],
  headerActions: [ansibleRepositoryCreateAction], // Add repository
  listItemActions,
  noDataButton: ansibleRepositoryCreateAction.button,
  noDataDescription: msg`Repositories will appear once created.`,
  noDataTitle: msg`No repositories yet`,
  query: ({ params }) => {
    const queryParams = { ...params };

    if (queryParams['status']) {
      const status = queryParams['status'];
      delete queryParams['status'];
      queryParams['pulp_label_select'] = `pipeline=${status}`;
    }
    return AnsibleRepositoryAPI.list(queryParams);
  },
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
        <td>
          {!item.remote ? (
            t`no remote`
          ) : !item.last_sync_task ? (
            t`never synced`
          ) : (
            <>
              {lastSyncStatus(item)} {lastSynced(item)}
            </>
          )}
        </td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <ListItemActions kebabItems={kebabItems} />
      </tr>
    );
  },
  sortHeaders: [
    {
      title: msg`Repository name`,
      type: 'alpha',
      id: 'name',
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
