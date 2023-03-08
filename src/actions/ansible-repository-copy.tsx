import { t } from '@lingui/macro';
import React from 'react';
import { getRepoUrl } from 'src/utilities';
import { Action } from './action';

export const ansibleRepositoryCopyAction = Action({
  title: t`Copy CLI configuration`,
  onClick: (item, { addAlert }) => {
    const cliConfig = [
      '[galaxy]',
      `server_list = ${item.name}_repo`,
      '',
      `[galaxy_server.${item.name}_repo]`,
      `url=${getRepoUrl()}`,
      'token=<put your token here>',
    ].join('\n');

    navigator.clipboard.writeText(cliConfig);
    addAlert({
      title: t`Successfully copied to clipboard`,
      variant: 'success',
      description: <pre>{cliConfig}</pre>,
    });
  },
});
