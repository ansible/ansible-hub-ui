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
import { isLoggedIn } from 'src/permissions';
import { parsePulpIDFromURL } from 'src/utilities';

interface IState {}

export const AnsibleRepositoryList = ListPage<AnsibleRepositoryType, IState>({
  condition: isLoggedIn,
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
  noDataButton: ansibleRepositoryCreateAction.button(
    null,
    null,
  ) as React.ReactElement,
  noDataDescription: t`Repositories will appear once created.`,
  noDataTitle: t`No repositories yet`,
  query: ({ params }) => AnsibleRepositoryAPI.list(params),
  renderTableRow(item: AnsibleRepositoryType, index: number, actionContext) {
    const { name, pulp_created, pulp_href } = item;
    const id = parsePulpIDFromURL(pulp_href);

    const kebabItems = [
      // Edit
      ansibleRepositoryEditAction,
      // Sync
      ansibleRepositorySyncAction,
      // Copy CLI configuration
      ansibleRepositoryCopyAction,
      // Delete
      ansibleRepositoryDeleteAction,
    ].map((action) => action.dropdownItem({ ...item, id }, actionContext));

    return (
      <tr key={index}>
        <td>
          <Link to={formatPath(Paths.ansibleRepositoryDetail, { name })}>
            {name}
          </Link>
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
      title: t`Repository name`,
      type: 'alpha',
      id: 'name',
    },
    // TODO
    // {
    //  title: t`Sync status`,
    //  type: 'none',
    //  id: 'last_sync_task.error',
    // },
    // {
    //   title: t`Last synced`,
    //   type: 'none',
    //   id: 'last_synced_metadata_time',
    // },
    {
      title: t`Created date`,
      type: 'numeric',
      id: 'pulp_created',
    },
  ],
  title: t`Repositories`,
});

export default AnsibleRepositoryList;
