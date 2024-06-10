import { t } from '@lingui/macro';
import React from 'react';
import {
  AnsibleRepositoryAPI,
  type CollectionVersionSearch,
  SigningServiceAPI,
} from 'src/api';
import { type AlertType, MultiRepoModal } from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { parsePulpIDFromURL, waitForTaskUrl } from 'src/utilities';

interface IProps {
  addAlert: (alert: AlertType) => void;
  closeAction: () => void;
  collectionVersion: CollectionVersionSearch;
  finishAction: () => void;
}

export const ApproveModal = ({
  addAlert: parentAddAlert,
  closeAction,
  collectionVersion,
  finishAction,
}: IProps) => {
  const { settings } = useContext();
  const { collection_version, repository } = collectionVersion;
  const { namespace, name, version, pulp_href } = collection_version;

  function approve({ addAlert, selectedRepos, setLoading }) {
    let error = '';

    async function approveAsync() {
      const repo_id = parsePulpIDFromURL(repository.pulp_href);
      const params = {
        collection_versions: [pulp_href],
        destination_repositories: selectedRepos.map((repo) => repo.pulp_href),
      };

      if (settings.GALAXY_AUTO_SIGN_COLLECTIONS) {
        const signingServiceName = settings.GALAXY_COLLECTION_SIGNING_SERVICE;

        error = t`Signing service ${signingServiceName} not found`;
        const signingList = await SigningServiceAPI.list({
          name: signingServiceName,
          page_size: 1,
        });
        if (signingList.data.results.length) {
          params['signing_service'] = signingList.data.results[0].pulp_href;
        } else {
          throw new Error();
        }
        error = '';
      }

      const task = (
        await AnsibleRepositoryAPI.moveCollectionVersion(repo_id, params)
      )?.data?.task;
      await waitForTaskUrl(task);

      finishAction();
      parentAddAlert({
        title: t`Certification status for collection "${namespace} ${name} v${version}" has been successfully updated.`,
        variant: 'success',
      });
    }

    setLoading(true);
    return approveAsync()
      .catch(() =>
        addAlert({
          title: t`Failed to approve collection.`,
          variant: 'danger',
          description: error,
        }),
      )
      .finally(() => setLoading(false));
  }

  return (
    <MultiRepoModal
      closeAction={closeAction}
      collectionVersion={collectionVersion}
      pipeline='pipeline=approved'
      submitAction={approve}
    />
  );
};
