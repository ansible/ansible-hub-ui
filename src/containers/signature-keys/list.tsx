import { t } from '@lingui/macro';
import React from 'react';
import { signatureKeyDownloadAction } from 'src/actions';
import { SigningServiceAPI, SigningServiceType } from 'src/api';
import {
  ClipboardCopy,
  DateComponent,
  ListItemActions,
  ListPage,
} from 'src/components';
import { isLoggedIn } from 'src/permissions';

export const SignatureKeysList = ListPage<SigningServiceType>({
  condition: isLoggedIn,
  defaultPageSize: 100,
  displayName: 'SignatureKeysList',
  errorTitle: t`Signature keys could not be displayed.`,
  filterConfig: [
    {
      id: 'name',
      title: t`Name`,
    },
  ],
  noDataDescription: t`Signature keys will appear once created.`,
  noDataTitle: t`No signature keys yet`,
  query: ({ params }) => SigningServiceAPI.list(params),
  renderTableRow(item: SigningServiceType, index: number, actionContext) {
    const { name, pubkey_fingerprint, public_key, pulp_created } = item;

    const dropdownItems = [
      signatureKeyDownloadAction.dropdownItem({ public_key }, actionContext),
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
  title: t`Signature keys`,
});

export default SignatureKeysList;
