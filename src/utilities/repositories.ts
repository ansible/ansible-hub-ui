import { t } from '@lingui/macro';
import {
  AnsibleRepositoryAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
} from 'src/api';
import { parsePulpIDFromURL } from './parse-pulp-id';
import { waitForTaskUrl } from './wait-for-task';

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
