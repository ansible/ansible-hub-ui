import { t } from '@lingui/macro';
import { Action } from './action';

export const signatureKeyDownloadAction = Action({
  title: t`Download key`,
  onClick: ({ public_key }) =>
    (document.location =
      'data:application/octet-stream,' + encodeURIComponent(public_key)),
});
