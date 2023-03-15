import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { CollectionVersion, Repositories } from 'src/api';
import { AlertList, AlertType, CheckboxRow } from 'src/components';

interface IProps {
  closeAction: () => void;
  collectionVersion: CollectionVersion;
  addAlert: (alert) => void;
}

export const ApproveModal = (props: IProps) => {
  const [repositoryList, setRepositoryList] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  const buttonClick = () => {};

  const addAlert = (alert: AlertType) => {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  };

  const closeAlert = () => {
    setAlerts([]);
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
        <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
        {loading && <Spinner />}
      </Modal>
    </>
  );
};
