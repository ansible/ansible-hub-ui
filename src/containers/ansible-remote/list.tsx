import { msg, t } from '@lingui/core/macro';
import { Td, Tr } from '@patternfly/react-table';
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
import { AnsibleRemoteAPI, type AnsibleRemoteType } from 'src/api';
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
  errorTitle: msg`Remotes could not be displayed.`,
  filterConfig: () => [
    {
      id: 'name__icontains',
      title: t`Remote name`,
    },
  ],
  headerActions: [ansibleRemoteCreateAction], // Add remote
  listItemActions,
  noDataButton: ansibleRemoteCreateAction.button,
  noDataDescription: msg`Remotes will appear once created.`,
  noDataTitle: msg`No remotes yet`,
  query: ({ params }) => AnsibleRemoteAPI.list(params),
  renderTableRow(item: AnsibleRemoteType, index: number, actionContext) {
    const { name, pulp_href, url } = item;
    const id = parsePulpIDFromURL(pulp_href);

    const kebabItems = listItemActions.map((action) =>
      action.dropdownItem({ ...item, id }, actionContext),
    );

    return (
      <Tr key={index}>
        <Td>
          <Link to={formatPath(Paths.ansibleRemoteDetail, { name })}>
            {name}
          </Link>
        </Td>
        <Td>
          <CopyURL url={url} />
        </Td>
        <ListItemActions kebabItems={kebabItems} />
      </Tr>
    );
  },
  sortHeaders: [
    {
      title: msg`Remote name`,
      type: 'alpha',
      id: 'name',
    },
    {
      title: msg`URL`,
      type: 'alpha',
      id: 'url',
    },
  ],
  title: msg`Remotes`,
});

export default AnsibleRemoteList;
