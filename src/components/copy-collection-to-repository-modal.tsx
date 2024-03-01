import { t } from '@lingui/macro';
import React from 'react';
import {
  AnsibleRepositoryAPI,
  CollectionVersionSearch,
  SigningServiceAPI,
} from 'src/api';
import { AlertType, MultiRepoModal } from 'src/components';
import { useHubContext } from 'src/loaders/app-context';
import { errorMessage, parsePulpIDFromURL, taskAlert } from 'src/utilities';

interface IProps {
  addAlert: (alert: AlertType) => void;
  closeAction: () => void;
  collectionVersion: CollectionVersionSearch;
}

export const CopyCollectionToRepositoryModal = ({
  addAlert: parentAddAlert,
  closeAction,
  collectionVersion,
}: IProps) => {
  const { settings } = useHubContext();
  const { collection_version, repository } = collectionVersion;
  const { namespace, name, version, pulp_href } = collection_version;

  async function copyToRepositories({ addAlert, selectedRepos, setLoading }) {
    setLoading(true);

    const repo_id = parsePulpIDFromURL(repository.pulp_href);
    const params = {
      collection_versions: [pulp_href],
      destination_repositories: selectedRepos.map((repo) => repo.pulp_href),
    };

    const signingServiceName = settings.GALAXY_COLLECTION_SIGNING_SERVICE;
    if (signingServiceName) {
      let signingService = null;
      try {
        const signingList = await SigningServiceAPI.list({
          name: signingServiceName,
          page_size: 1,
        });
        signingService = signingList.data.results[0].pulp_href;
      } catch {
        setLoading(false);
        addAlert({
          title: t`Failed to copy collection version.`,
          variant: 'danger',
          description: t`Signing service ${signingServiceName} not found`,
        });
        return;
      }

      params['signing_service'] = signingService;
    }

    return AnsibleRepositoryAPI.copyCollectionVersion(repo_id, params)
      .then(({ data }) => {
        selectedRepos.forEach(({ name: repo }) =>
          parentAddAlert(
            taskAlert(
              data.task,
              t`Started adding ${namespace}.${name} v${version} from "${repository.name}" to repository "${repo}".`,
            ),
          ),
        );
        closeAction();
      })
      .catch((e) =>
        addAlert({
          variant: 'danger',
          title: t`Collection ${namespace}.${name} v${version} could not be copied.`,
          description: errorMessage(e.status, e.statusText),
        }),
      )
      .finally(() => setLoading(false));
  }

  return (
    <MultiRepoModal
      closeAction={closeAction}
      collectionVersion={collectionVersion}
      submitAction={copyToRepositories}
    />
  );
};
