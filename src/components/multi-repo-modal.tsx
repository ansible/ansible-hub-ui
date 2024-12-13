import { t } from '@lingui/core/macro';
import { Button, Modal } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import {
  type AnsibleRepositoryType,
  CollectionVersionAPI,
  type CollectionVersionSearch,
} from 'src/api';
import {
  AlertList,
  type AlertType,
  MultipleRepoSelector,
  Spinner,
  closeAlert,
} from 'src/components';

interface IProps {
  closeAction: () => void;
  collectionVersion: CollectionVersionSearch;
  pipeline?: string;
  submitAction: ({ addAlert, selectedRepos, setLoading }) => void;
}

export const MultiRepoModal = ({
  closeAction,
  collectionVersion: { collection_version },
  pipeline,
  submitAction,
}: IProps) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [disabledRepos, setDisabledRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<AnsibleRepositoryType[]>(
    [],
  );

  function addAlert(alert: AlertType) {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }

  function queryDisabled() {
    // get repository list for selected collection
    // TODO: handle more pages
    const { name, namespace, version } = collection_version;

    CollectionVersionAPI.list({
      namespace,
      name,
      version,
      page: 1,
      page_size: 100,
      ...(pipeline ? { repository_label: pipeline } : {}),
    })
      .then(
        ({
          data: {
            data,
            meta: { count },
          },
        }) => {
          setDisabledRepos(data.map(({ repository: { name } }) => name));
          if (count > 100) {
            addAlert({
              variant: 'warning',
              title: t`The collection exists in too many repositories. Some repositories may not be disabled and preselected correctly.`,
            });
          }
        },
      )
      .catch(() =>
        addAlert({
          variant: 'danger',
          title: t`Failed to query repositories.`,
        }),
      );
  }

  useEffect(() => {
    // check for approval repos that are already in collection and select them in UI
    queryDisabled();
  }, []);

  return (
    <Modal
      actions={[
        <Button
          key='confirm'
          onClick={() =>
            submitAction({
              addAlert,
              selectedRepos,
              setLoading,
            })
          }
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
      isOpen
      onClose={closeAction}
      title={t`Select repositories`}
      variant='large'
    >
      <section className='modal-body' data-cy='modal-body'>
        <MultipleRepoSelector
          addAlert={addAlert}
          disabledRepos={disabledRepos}
          params={pipeline ? { pulp_label_select: pipeline } : null}
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
