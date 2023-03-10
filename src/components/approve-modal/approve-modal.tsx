import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
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
  const [selectedRepos, setSelectedRepos] = useState(
    props.repositoryList.map((item) => item.name),
  );
  const [loading, setLoading] = useState(false);

  // TODO - mix data - this must be removed and repositoryList must have again type Repository
  useEffect(() => {
    eval("props.repositoryList.push({name : 'testRepo123'})");
  }, []);

  let errors = [];

  const addAlert = (alert: AlertType) => {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  };

  const closeAlert = () => {
    setAlerts([]);
  };

  let movedRepo = null;

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

  // TODO - selection of test, published and testRepo123 dont work
  const buttonClick = async () => {
    errors = selectedRepos.map((item) => {
      return { success: false, destinationRepo: item };
    });

    // do the operation
    if (selectedRepos.length == 0) {
      addAlert({
        variant: 'warning',
        title: t`You must select at least one repository`,
      });
    }

    const listToApprove = [...selectedRepos.reverse()];

    // move sequentialy, call move until first collection is moved with successs
    while (!movedRepo && listToApprove.length > 0) {
      debugger;

      await moveOrCopy(
        props.collectionVersion.repository_list[0],
        listToApprove[listToApprove.length - 1],
        true,
      );
      listToApprove.pop();
    }

    debugger;

    const promises = [];

    // copy the rest of the repos, this can be done in paralel, using moved repo
    listToApprove.forEach((repo, i) => {
      promises.push(moveOrCopy(movedRepo, repo, false));
    });

    await Promise.all(promises);

    debugger;

    const error = errors.filter((item) => item.success == false).length > 0;

    const title = t`Approval results`;
    let description = '';
    const variant = error ? 'danger' : 'success';
    const repoOk = errors
      .filter((item) => item.success == true)
      .map((item) => item.destinationRepo)
      .join(', ');
    const repoFailed = errors
      .filter((item) => item.success == false)
      .map((item) => item.destinationRepo)
      .join(', ');
    const allFailed = errors.filter((item) => item.success == true).length == 0;

    if (error) {
      if (!allFailed) {
        description = t`Error occured during approval. Collection was moved to those repositories: ${repoOk}. But failed to move to those repositories: ${repoFailed}.`;
      } else {
        description = t`Error occured during approval. Failed to move to all selected repositories: ${repoFailed}.`;
      }
      addAlert({ id: 'approvalAlert', title, description, variant });
    } else {
      description = t`Collection was sucessfuly moved to all selected repositories: ${repoOk}.`;
      props.addAlert({ id: 'approvalAlert', title, description, variant });
      props.closeAction();
    }
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
        errors[
          errors.findIndex((item) => item.destinationRepo == destinationRepo)
        ] = { success: true, destinationRepo };
        if (move) {
          movedRepo = destinationRepo;
        }
        debugger;
      })
      .catch((error) => {
        const description = !error.response
          ? error
          : errorMessage(error.response.status, error.response.statusText);

        addAlert({
          title: t`Changes to certification status for collection "${props.collectionVersion.namespace} ${props.collectionVersion.name} v${props.collectionVersion.version}" could not be saved to ${destinationRepo} repository.`,
          variant: 'danger',
          id: 'approvalAlert',
          description,
        });

        errors[
          errors.findIndex((item) => item.destinationRepo == destinationRepo)
        ] = { success: false, destinationRepo };
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
