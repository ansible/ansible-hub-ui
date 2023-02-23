import { t } from '@lingui/macro';
import { Button, ButtonVariant, Modal, Spinner } from '@patternfly/react-core';
import { totalmem } from 'os';
import React, { useEffect, useState } from 'react';
import { wisdomDenyIndexAPI } from 'src/api';
import { AlertList, AlertType } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  scope: string;
  reference: string;
  cancelAction: () => void;
}

export const WisdomModal = (props: IProps) => {
  const [isInDenyIndex, setIsInDenyIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  let titleAddFailed = '';
  let titleRemoveFailed = '';
  let titleWillBeUsed = '';
  let titleWillNotBeUsed = '';
  const namespace = props.reference;

  if (props.scope == 'namespace') {
    titleAddFailed = t`Failed to add namespace to Ansible Wisdom.`;
    titleRemoveFailed = t`Failed to remove namespace from Ansible Wisdom.`;
    titleWillBeUsed = t`The namespace ${namespace} will be used by Ansible Wisdom`;
    titleWillNotBeUsed = t`The namespace ${namespace} will not be used by Ansible Wisdom`;
  }

  if (props.scope == 'legacy_namespace') {
    titleAddFailed = t`Failed to add legacy namespace to Ansible Wisdom.`;
    titleRemoveFailed = t`Failed to remove legacy namespace from Ansible Wisdom.`;
    titleWillBeUsed = t`The legacy namespace ${namespace} will be used by Ansible Wisdom`;
    titleWillNotBeUsed = t`The legacy namespace ${namespace} will not be used by Ansible Wisdom`;
  }

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
          title: titleAddFailed,
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
          title: titleRemoveFailed,
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

  return (
    <Modal
      actions={actions}
      isOpen={true}
      onClose={props.cancelAction}
      title={t`Wisdom Modal`}
      titleIconVariant='warning'
      variant='small'
    >
      <AlertList alerts={alerts} closeAlert={() => closeAlert()} />
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <div>
            {!loading && isInDenyIndex ? titleWillNotBeUsed : titleWillBeUsed}
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
