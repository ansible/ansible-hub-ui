import { t } from '@lingui/macro';
import {
  AnsibleDistributionAPI,
  AnsibleRepositoryAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
  Repositories,
} from 'src/api';
import {
  RepositoriesUtils,
  errorMessage,
  parsePulpIDFromURL,
  waitForTask,
} from 'src/utilities';

export async function approve(
  collection: CollectionVersionSearch,
  setState,
  addAlert,
  query?,
) {
  if (!collection) {
    // I hope that this may not occure ever, but to be sure...
    addAlert(
      t`Approval failed.`,
      'danger',
      t`Collection not found in any repository.`,
    );
    return;
  }

  const approvedRepos = await RepositoriesUtils.listApproved();
  if (approvedRepos.length == 1) {
    if (collection.repository) {
      updateCertification(
        collection.collection_version,
        collection.repository.name,
        approvedRepos[0].name,
        addAlert,
        query,
      );
    } else {
      addAlert(
        t`Approval failed.`,
        'danger',
        t`Collection has to be in rejected or staging repository.`,
      );
    }
  } else {
    loadDataForApprovalModal(collection, approvedRepos, setState);
  }
}

async function loadDataForApprovalModal(collection, approvedRepos, setState) {
  Promise.all([
    transformToCollectionVersion(collection),
    loadRepo('staging'),
    loadRepo('rejected'),
  ]).then(([collectionVersion, staging, rejected]) => {
    setState({
      approvalModal: {
        collectionVersion,
        approvedRepos,
        stagingRepos: staging.map((res) => res.name),
        rejectedRepo: rejected[0].name,
      },
    });
  });
}

async function loadRepo(pipeline: string) {
  const repoList = await Repositories.list({
    pulp_label_select: `pipeline=${pipeline}`,
  });
  return repoList.data.results;
}

// compose from collectionVersionSearch to CollectionVersion structure for approval modal
export async function transformToCollectionVersion(
  collection: CollectionVersionSearch,
) {
  const repoList = await RepositoriesUtils.getCollectionRepoList(collection);

  const { collection_version } = collection;
  const id = parsePulpIDFromURL(collection_version.pulp_href);
  const collectionVersion = {
    id,
    version: collection_version.version,
    namespace: collection_version.namespace,
    name: collection_version.name,
    repository_list: repoList,
  };

  return collectionVersion;
}

export async function distributionByRepoName(name: string) {
  const repository = (await AnsibleRepositoryAPI.list({ name }))?.data
    ?.results?.[0];
  if (!repository) {
    return Promise.reject(t`Failed to find repository ${name}`);
  }

  const distribution = (
    await AnsibleDistributionAPI.list({ repository: repository.pulp_href })
  )?.data?.results?.[0];
  if (!distribution) {
    return Promise.reject(
      t`Failed to find a distribution for repository ${name}`,
    );
  }

  return distribution;
}

export function updateCertification(
  version: CollectionVersionSearch['collection_version'],
  originalRepo: string,
  destinationRepo: string,
  addAlert,
  query,
) {
  // galaxy_ng CollectionRepositoryMixing.get_repos uses the distribution base path to look up repository pk
  // there ..may be room for simplification since we already know the repo; OTOH also compatibility concerns

  return Promise.all([
    distributionByRepoName(originalRepo),
    distributionByRepoName(destinationRepo),
  ])
    .then(([source, destination]) =>
      CollectionVersionAPI.move(
        version.namespace,
        version.name,
        version.version,
        source.base_path,
        destination.base_path,
      ),
    )
    .then((result) => waitForTask(result.data.remove_task_id, { waitMs: 500 }))
    .then(() =>
      addAlert(
        t`Certification status for collection "${version.namespace} ${version.name} v${version.version}" has been successfully updated.`,
        'success',
      ),
    )
    .then(query)
    .catch((error) => {
      const description = !error.response
        ? error
        : errorMessage(error.response.status, error.response.statusText);

      addAlert(
        t`Changes to certification status for collection "${version.namespace} ${version.name} v${version.version}" could not be saved.`,
        'danger',
        description,
      );
    });
}
