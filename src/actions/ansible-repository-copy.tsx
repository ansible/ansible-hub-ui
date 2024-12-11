import { msg, t } from '@lingui/core/macro';
import React from 'react';
import { getRepoURL, repositoryBasePath } from 'src/utilities';
import { Action } from './action';

export const ansibleRepositoryCopyAction = Action({
  title: msg`Copy CLI configuration`,
  onClick: async (item, { addAlert }) => {
    let distroBasePath = null;

    if (!item.distroBasePath) {
      addAlert({
        id: 'copy-cli-config',
        title: t`Loading distribution...`,
        variant: 'info',
      });

      distroBasePath = await repositoryBasePath(
        item.name,
        item.pulp_href,
      ).catch(() => null);
    } else {
      distroBasePath = item.distroBasePath;
    }

    if (!distroBasePath) {
      addAlert({
        id: 'copy-cli-config',
        title: t`There are no distributions associated with this repository.`,
        variant: 'danger',
      });
      return;
    }

    const cliConfig = [
      '[galaxy]',
      `server_list = ${distroBasePath}`,
      '',
      `[galaxy_server.${distroBasePath}]`,
      `url=${getRepoURL(distroBasePath)}`,
      'token=<put your token here>',
    ].join('\n');

    navigator.clipboard.writeText(cliConfig);
    addAlert({
      description: <pre>{cliConfig}</pre>,
      id: 'copy-cli-config',
      title: t`Successfully copied to clipboard`,
      variant: 'success',
    });
  },
  disabled: (item) => {
    // disabled check only available on detail screen
    if ('distroBasePath' in item && !item.distroBasePath) {
      return t`There are no distributions associated with this repository.`;
    }

    return null;
  },
});
