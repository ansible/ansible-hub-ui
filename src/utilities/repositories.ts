import { t } from '@lingui/macro';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  CollectionVersionAPI,
  CollectionVersionSearch,
} from 'src/api';
import { parsePulpIDFromURL } from './parse-pulp-id';
import { waitForTaskUrl } from './wait-for-task';

async function getAll(additionalParams = {}) {
  let list = [];

  // loop max 10 times (= 1000 items)
  for (let page = 1; page <= 10; page++) {
    const result = await AnsibleRepositoryAPI.list({
      ...additionalParams,
      page,
      page_size: 100,
    });

    list = list.concat(result.data.results);
    if (list.length >= result.data.count) {
      return list;
    }
  }
}

export function listApproved(): Promise<AnsibleRepositoryType[]> {
  return getAll({ pulp_label_select: 'pipeline=approved' });
}

export function listAll(): Promise<AnsibleRepositoryType[]> {
  return getAll();
}

export async function repositoryRemoveCollection(
  repoName,
  collectionVersion_pulp_href,
) {
  const repo = (
    await AnsibleRepositoryAPI.list({ name: repoName, page_size: 1 })
  )?.data?.results?.[0];
  if (!repo) {
    return Promise.reject({ error: t`Repository ${repoName} not found.` });
  }

  const task = (
    await AnsibleRepositoryAPI.removeContent(
      parsePulpIDFromURL(repo.pulp_href),
      collectionVersion_pulp_href,
    )
  )?.data?.task;

  await waitForTaskUrl(task);
}

export async function getCollectionRepoList(
  collection: CollectionVersionSearch,
) {
  const { name, namespace, version } = collection.collection_version;

  // get repository list for selected collection
  // TODO: support more pages
  const collectionInRepos = await CollectionVersionAPI.list({
    namespace,
    name,
    version,
    page_size: 100,
    offset: 0,
  });

  const collectionRepos = collectionInRepos.data.data.map(
    ({ repository }) => repository.name,
  );

  return collectionRepos;
}
