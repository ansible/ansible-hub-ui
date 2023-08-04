import { t } from '@lingui/macro';
import { AnsibleDistributionAPI, AnsibleRepositoryAPI } from 'src/api';

// returns the preferred distribution base_path given a repo name
// if there is a distribution with the same name as the repository, it will be used (as long as it's connected to the right repo too)
// if not, the oldest will be used
// reject if no distributions or repository
// optional pulp_href param skips repo lookup

export function repositoryBasePath(name, pulp_href?): Promise<string> {
  return Promise.all([
    pulp_href
      ? Promise.resolve({ name, pulp_href })
      : AnsibleRepositoryAPI.list({ name, page_size: 1 }).then(firstResult),
    AnsibleDistributionAPI.list({ name, page_size: 1 }).then(firstResult),
  ]).then(async ([repository, distribution]) => {
    if (!repository) {
      return Promise.reject(t`Failed to find repository ${name}`);
    }

    if (distribution && distribution.repository === repository.pulp_href) {
      return distribution.base_path;
    }

    distribution = await AnsibleDistributionAPI.list({
      repository: repository.pulp_href,
      sort: 'pulp_created',
      page_size: 1,
    }).then(firstResult);

    if (!distribution) {
      return Promise.reject(
        t`Failed to find a distribution for repository ${name}`,
      );
    }

    return distribution.base_path;
  });
}

function firstResult({ data: { results } }) {
  return results[0];
}
