import { msg } from '@lingui/core/macro';
import { downloadString } from 'src/utilities';
import { Action } from './action';

export const ansibleRemoteDownloadClientAction = Action({
  title: msg`Download client certificate`,
  onClick: ({ client_cert }) => downloadString(client_cert, 'client_cert'),
  visible: ({ client_cert }) => !!client_cert,
});
