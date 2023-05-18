import { t } from '@lingui/macro';
import React from 'react';
import { AnsibleDistributionAPI } from 'src/api';
import { getRepoURL } from 'src/utilities';
import { Action } from './action';

export const ansibleRepositoryCopyAction = Action({
  title: t`Copy CLI configuration`,
  onClick: async (item, { addAlert }) => {
    let distribution = null;
    if (!item.distributions) {
      addAlert({
        id: 'copy-cli-config',
        title: t`Loading distribution...`,
        variant: 'info',
      });

      distribution = (
        await AnsibleDistributionAPI.list({
          repository: item.pulp_href,
        })
      )?.data?.results?.[0];
    } else {
      distribution = item.distributions?.[0];
    }

    if (!distribution) {
      addAlert({
        id: 'copy-cli-config',
        title: t`There are no distributions associated with this repository.`,
        variant: 'danger',
      });
      return;
    }

    const cliConfig = [
      '[galaxy]',
      `server_list = ${distribution.base_path}`,
      '',
      `[galaxy_server.${distribution.base_path}]`,
      `url=${getRepoURL(distribution.base_path)}`,
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
  disabled: ({ distributions }) => {
    if (distributions && !distributions.length) {
      return t`There are no distributions associated with this repository.`;
    }

    return null;
  },
});
