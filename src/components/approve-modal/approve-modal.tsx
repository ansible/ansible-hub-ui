import { select, t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { Repositories } from 'src/api';
import { Repository } from 'src/api/response-types/repositories';
import { AlertList, AlertType, CheckboxRow } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  confirmAction: (
    selectedRepos: string[],
    addApproveModalAlert: (alert) => void,
  ) => void;
  closeAction: () => void;
  repositoryList: Repository[];
}

export const ApproveModal = (props: IProps) => {
  const [alerts, setAlerts] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);

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
    props.confirmAction(selectedRepos, addAlert);
    props.closeAction();
  };

  return (
    <>
      <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
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
      </Modal>
    </>
  );
};
