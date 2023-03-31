import { t } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ansibleRemoteCreateAction,
  ansibleRemoteDeleteAction,
  ansibleRemoteDownloadCAAction,
  ansibleRemoteDownloadClientAction,
  ansibleRemoteDownloadRequirementsAction,
  ansibleRemoteEditAction,
} from 'src/actions';
import { AnsibleRemoteAPI, AnsibleRemoteType } from 'src/api';
import { CopyURL, ListItemActions, ListPage } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { canViewAnsibleRemotes } from 'src/permissions';
import { parsePulpIDFromURL } from 'src/utilities';

const listItemActions = [
  // Edit
  ansibleRemoteEditAction,
  // Download requirements.yaml
  ansibleRemoteDownloadRequirementsAction,
  // Download client certificate
  ansibleRemoteDownloadClientAction,
  // Download CA certificate
  ansibleRemoteDownloadCAAction,
  // Delete
  ansibleRemoteDeleteAction,
];

const AnsibleRemoteList = ListPage<AnsibleRemoteType>({
  condition: canViewAnsibleRemotes,
  defaultPageSize: 10,
  defaultSort: '-pulp_created',
  displayName: 'AnsibleRemoteList',
  errorTitle: t`Remotes could not be displayed.`,
  extraState: {},
  filterConfig: [
    {
      id: 'name__icontains',
      title: t`Remote name`,
    },
  ],
  headerActions: [ansibleRemoteCreateAction], // Add remote
  listItemActions,
  noDataButton: ansibleRemoteCreateAction.button,
  noDataDescription: t`Remotes will appear once created.`,
  noDataTitle: t`No remotes yet`,
  query: ({ params }) => AnsibleRemoteAPI.list(params),
  renderTableRow(item: AnsibleRemoteType, index: number, actionContext) {
    const { name, pulp_href, url } = item;
    const id = parsePulpIDFromURL(pulp_href);

    const kebabItems = listItemActions.map((action) =>
      action.dropdownItem({ ...item, id }, actionContext),
    );

    return (
      <tr key={index}>
        <td>
          <Link to={formatPath(Paths.ansibleRemoteDetail, { name })}>
            {name}
          </Link>
        </td>
        <td>
          <CopyURL url={url} />
        </td>
        <ListItemActions kebabItems={kebabItems} />
      </tr>
    );
  },
  sortHeaders: [
    {
      title: t`Remote name`,
      type: 'alpha',
      id: 'name',
    },
    {
      title: t`URL`,
      type: 'alpha',
      id: 'url',
    },
  ],
  title: t`Remotes`,
});

export default AnsibleRemoteList;
