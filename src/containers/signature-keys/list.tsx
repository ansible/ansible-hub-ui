import { t } from '@lingui/macro';
import * as React from 'react';
import { DropdownItem } from '@patternfly/react-core';
import { ClipboardCopy, DateComponent, ListItemActions } from 'src/components';
import { SigningServiceAPI, SigningServiceType } from 'src/api';
import { ListPage } from './list-page';

export const SignatureKeysList = ListPage<SigningServiceType>({
  displayName: 'SignatureKeysList',
  title: t`Signature keys`,
  filterConfig: [
    {
      id: 'name',
      title: t`Name`,
    },
  ],
  sortHeaders: [
    {
      title: t`Name`,
      type: 'none',
      id: 'name',
    },
    {
      title: t`Key fingerprint`,
      type: 'none',
      id: 'pubkey_fingerprint',
    },
    {
      title: t`Created on`,
      type: 'none',
      id: 'pulp_created',
    },
    {
      title: t`Public key`,
      type: 'none',
      id: 'public_key',
    },
    {
      title: '',
      type: 'none',
      id: 'kebab',
    },
  ],
  noDataTitle: t`No signature keys yet`,
  noDataDescription: t`Signature keys will appear once created.`,
  renderTableRow(item: SigningServiceType, index: number) {
    const { name, pubkey_fingerprint, public_key, pulp_created } = item;

    const dropdownItems = [
      <DropdownItem
        key='download-key'
        onClick={() => {
          document.location =
            'data:application/octet-stream,' + encodeURIComponent(public_key);
        }}
      >
        {t`Download key`}
      </DropdownItem>,
    ];

    return (
      <tr key={index}>
        <td>{name}</td>
        <td>{pubkey_fingerprint}</td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <td>
          <ClipboardCopy isCode isReadOnly variant={'expansion'}>
            {public_key}
          </ClipboardCopy>
        </td>
        <ListItemActions kebabItems={dropdownItems} />
      </tr>
    );
  },
  errorTitle: t`Signature keys could not be displayed.`,
  query: ({ params }) => SigningServiceAPI.list(params),
});

export default SignatureKeysList;
