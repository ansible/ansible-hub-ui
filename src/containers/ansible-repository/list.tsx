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
import {
  DateComponent,
  ListItemActions,
  ListPage,
  PulpLabels,
} from 'src/components';
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
      id: 'pulp_label_select',
      title: msg`Pipeline`,
      inputType: 'select',
      options: [
        {
          id: `pipeline=${Constants.NOTCERTIFIED}`,
          title: msg`Rejected`,
        },
        {
          id: `pipeline=${Constants.NEEDSREVIEW}`,
          title: msg`Needs Review`,
        },
        {
          id: `pipeline=${Constants.APPROVED}`,
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
  query: ({ params }) => AnsibleRepositoryAPI.list(params),
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
      <tr key={index}>
        <td>
          <Link to={formatPath(Paths.ansibleRepositoryDetail, { name })}>
            {name}
          </Link>
        </td>
        <td>
          <PulpLabels labels={pulp_labels} />
        </td>
        <td>{isPrivate ? t`Yes` : t`No`}</td>
        <td>
          {!remote ? (
            t`no remote`
          ) : !last_sync_task ? (
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
