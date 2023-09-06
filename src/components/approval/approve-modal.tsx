import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import {
  AnsibleRepositoryAPI,
  AnsibleRepositoryType,
  CollectionVersionSearch,
  SigningServiceAPI,
} from 'src/api';
import {
  AlertList,
  AlertType,
  MultipleRepoSelector,
  closeAlert,
} from 'src/components';
import { useContext } from 'src/loaders/app-context';
import {
  getCollectionRepoList,
  parsePulpIDFromURL,
  waitForTaskUrl,
} from 'src/utilities';

interface IProps {
  addAlert: (alert: AlertType) => void;
  closeAction: () => void;
  collectionVersion: CollectionVersionSearch;
  finishAction: () => void;
}

export const ApproveModal = ({
  addAlert: parentAddAlert,
  closeAction,
  collectionVersion: { collection_version, repository },
  finishAction,
}: IProps) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [disabledRepos, setDisabledRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<AnsibleRepositoryType[]>(
    [],
  );

  const { settings } = useContext();
  const { namespace, name, version, pulp_href } = collection_version;

  function approve() {
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

  function addAlert(alert: AlertType) {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }

  useEffect(() => {
    // check for approval repos that are already in collection and select them in UI
    // TODO better way?
    getCollectionRepoList({ collection_version } as CollectionVersionSearch, {
      repository_label: 'pipeline=approved',
    }).then(setDisabledRepos);
  }, []);

  return (
    <Modal
      actions={[
        <Button
          key='confirm'
          onClick={approve}
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
          params={{ pulp_label_select: 'pipeline=approved' }}
          selectedRepos={selectedRepos}
          setSelectedRepos={setSelectedRepos}
        />
        {loading && <Spinner size='lg' />}
      </section>

      <AlertList
        alerts={alerts}
        closeAlert={(i) => closeAlert(i, { alerts, setAlerts })}
      />
    </Modal>
  );
};
