import { t } from '@lingui/macro';
import { Button, ButtonVariant, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { wisdomDenyIndexAPI } from 'src/api';
import { AlertList, AlertType } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  scope: string;
  reference: string;
  cancelAction: () => void;
}

export const WisdomNamespaceModal = (props: IProps) => {
  const [isInDenyIndex, setIsInDenyIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    wisdomDenyIndexAPI
      .isInDenyIndex(props.scope, props.reference)
      .then((result) => {
        setIsInDenyIndex(result);
        setLoading(false);
      });
  }, []);

  const addAlert = (alert: AlertType) => {
    setAlerts([...alerts, alert]);
  };

  const closeAlert = () => {
    setAlerts([]);
  };

  const removeFromDenyIndex = () => {
    setLoading(true);
    wisdomDenyIndexAPI
      .removeFromDenyIndex(props.scope, props.reference)
      .then((result) => {
        setIsInDenyIndex(false);
        setLoading(false);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: t`Failed to add namespace to Ansible Wisdom.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
        setLoading(false);
      });
  };

  const addToDenyIndex = () => {
    setLoading(true);
    wisdomDenyIndexAPI
      .addToDenyIndex(props.scope, props.reference)
      .then((result) => {
        setIsInDenyIndex(true);
        setLoading(false);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: t`Failed to remove namespace from Ansible Wisdom.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
        setLoading(false);
      });
  };

  let actions = [];

  if (!loading) {
    if (isInDenyIndex) {
      actions.push(
        <Button
          key='remove'
          onClick={removeFromDenyIndex}
          variant={ButtonVariant.primary}
        >
          {t`Add to Ansible wisdom`}
        </Button>,
      );
    } else {
      actions.push(
        <Button
          key='add'
          onClick={addToDenyIndex}
          variant={ButtonVariant.primary}
        >
          {t`Remove from Ansible wisdom`}
        </Button>,
      );
    }

    actions.push(
      <Button key='add' onClick={() => props.cancelAction()} variant='link'>
        {t`Cancel`}
      </Button>,
    );
  }

  const namespace = props.reference;
  return (
    <Modal
      actions={actions}
      isOpen={true}
      onClose={props.cancelAction}
      title={t`Wisdom namespace modal`}
      titleIconVariant='warning'
      variant='small'
    >
      <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <div>
            {!loading && isInDenyIndex
              ? t`The namespace ${namespace} will not be used by Ansible Wisdom`
              : t`The namespace ${namespace} will be used by Ansible Wisdom`}
          </div>
          <br />
          <div>
            Some information about Ansible Wisdom and why it is good to have
            namespaces included in the project.
          </div>
        </div>
      )}
    </Modal>
  );
};
