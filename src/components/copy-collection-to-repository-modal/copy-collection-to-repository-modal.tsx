import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  CollectionVersionSearch,
  SigningServiceAPI,
} from 'src/api';
import { AlertType, MultipleRepoSelector } from 'src/components';
import { useContext } from 'src/loaders/app-context';
import {
  errorMessage,
  getCollectionRepoList,
  parsePulpIDFromURL,
  taskAlert,
} from 'src/utilities';

interface IProps {
  addAlert: (alert: AlertType) => void;
  closeAction: () => void;
  collection: CollectionVersionSearch;
}

// TODO unify with approveModal
export const CopyCollectionToRepositoryModal = ({
  addAlert,
  closeAction,
  collection: { collection_version, repository },
}: IProps) => {
  const [disabledRepos, setDisabledRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<AnsibleRepositoryType[]>(
    [],
  );

  const { settings } = useContext();
  const { namespace, name, version, pulp_href } = collection_version;

  const copyToRepositories = async () => {
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
          addAlert(
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
  };

  useEffect(() => {
    // check for approval repos that are already in collection and select them in UI
    // TODO better way?
    getCollectionRepoList({
      collection_version,
    } as CollectionVersionSearch).then(setDisabledRepos);
  }, []);

  return (
    <Modal
      actions={[
        <Button
          key='confirm'
          onClick={copyToRepositories}
          variant='primary'
          isDisabled={!selectedRepos.length || loading}
        >
          {t`Select`}
        </Button>,
        <Button
          key='cancel'
          onClick={closeAction}
          variant='link'
          isDisabled={loading}
        >
          {t`Cancel`}
        </Button>,
      ]}
      isOpen={true}
      onClose={closeAction}
      title={t`Select repositories`}
      variant='large'
    >
      <section className='modal-body' data-cy='modal-body'>
        <MultipleRepoSelector
          addAlert={addAlert}
          disabledRepos={disabledRepos}
          selectedRepos={selectedRepos}
          setSelectedRepos={setSelectedRepos}
        />
        {loading && <Spinner size='lg' />}
      </section>
    </Modal>
  );
};
