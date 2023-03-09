import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { CollectionVersionAPI } from 'src/api';
import { CollectionVersion } from 'src/api/response-types/collection';
import { Repository } from 'src/api/response-types/repositories';
import { AlertList, AlertType, CheckboxRow } from 'src/components';
import { errorMessage, waitForTask } from 'src/utilities';

interface IProps {
  closeAction: () => void;
  repositoryList: Repository[];
  collectionVersion: CollectionVersion;
  addAlert: (alert) => void;
}

export const ApproveModal = (props: IProps) => {
  const [alerts, setAlerts] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  const addAlert = (alert: AlertType) => {
    setAlerts([...alerts, alert]);
  };

  const closeAlert = () => {
    setAlerts([]);
  };

  const changeSelection = (name) => {
    const checked = selectedRepos.includes(name);

    if (checked) {
      // remove
      setSelectedRepos(selectedRepos.filter((element) => element != name));
    } else {
      // add
      setSelectedRepos([...selectedRepos, name]);
    }
  };

  const buttonClick = () => {
    // do the operation
    if (selectedRepos.length == 0) {
      addAlert({
        variant: 'warning',
        title: t`You must select at least one repository`,
      });
    }

    moveOrCopy(
      props.collectionVersion.repository_list[0],
      selectedRepos[0],
      true,
    )
      .then(() => {
        if (selectedRepos.length == 1) {
          return;
        }
        const promises = [];

        selectedRepos.forEach((repo, i) => {
          if (i == 0) {
            return;
          }

          promises.push(moveOrCopy(selectedRepos[0], repo, false));
        });

        return Promise.all(promises);
      })
      .then(() => {
        // TODO ?
      });
  };

  const moveOrCopy = (originalRepo, destinationRepo, move: boolean) => {
    let method = null;
    if (move) {
      method = CollectionVersionAPI.setRepository;
    } else {
      method = CollectionVersionAPI.copyToRepository;
    }

    return method
      .call(
        CollectionVersionAPI,
        props.collectionVersion.namespace,
        props.collectionVersion.name,
        props.collectionVersion.version,
        originalRepo,
        destinationRepo,
      )
      .then((result) => {
        let id = null;
        if (move) {
          id = result.data.remove_task_id;
        } else {
          id = result.data.task_id;
        }
        return waitForTask(id, { waitMs: 500 });
      })
      .then(() => {
        addAlert({
          title: t`Certification status for collection "${props.collectionVersion.namespace} ${props.collectionVersion.name} v${props.collectionVersion.version}" has been successfully updated to ${destinationRepo} repository.`,
          variant: 'success',
          id: destinationRepo,
        });
      })
      .catch((error) => {
        const description = !error.response
          ? error
          : errorMessage(error.response.status, error.response.statusText);

        addAlert({
          title: t`Changes to certification status for collection "${props.collectionVersion.namespace} ${props.collectionVersion.name} v${props.collectionVersion.version}" could not be saved to ${destinationRepo} repository.`,
          variant: 'danger',
          id: destinationRepo,
        });
      });
  };

  return (
    <>
      <Modal
        actions={[
          <Button key='confirm' onClick={buttonClick} variant='primary'>
            {t`Confirm`}
          </Button>,
          <Button key='cancel' onClick={props.closeAction} variant='link'>
            {t`Cancel`}
          </Button>,
        ]}
        isOpen={true}
        onClose={props.closeAction}
        title={t`Choose repositories`}
        titleIconVariant='warning'
        variant='small'
      >
        {t`Choose from available repositores. Collection will be approved and coppied to all of them.`}

        {props.repositoryList.map((repo, i) => (
          <CheckboxRow
            rowIndex={i}
            key={repo.name}
            isSelected={selectedRepos.includes(repo.name)}
            onSelect={() => {
              changeSelection(repo.name);
            }}
            data-cy={`ApproveModal-CheckboxRow-row-${repo.name}`}
          >
            <td>{repo.name}</td>
          </CheckboxRow>
        ))}
        <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
        {loading && <Spinner />}
      </Modal>
    </>
  );
};
