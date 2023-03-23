import { t } from '@lingui/macro';
import { downloadString } from 'src/utilities';
import { Action } from './action';

export const ansibleRemoteDownloadCAAction = Action({
  title: t`Download CA certificate`,
  onClick: ({ ca_cert }) => downloadString(ca_cert, 'ca_cert'),
  visible: ({ ca_cert }) => !!ca_cert,
});
