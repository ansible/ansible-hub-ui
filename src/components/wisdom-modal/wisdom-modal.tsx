import { Trans, t } from '@lingui/macro';
import { Button, ButtonVariant, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { wisdomDenyIndexAPI } from 'src/api';
import { AlertList, AlertType } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  scope: 'namespace' | 'legacy_namespace';
  reference: string;
  closeAction: () => void;
  addAlert?: (alert) => void;
}

export const WisdomModal = (props: IProps) => {
  const [isInDenyIndex, setIsInDenyIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const titleAddFailed = t`Failed to opt in to Wisdom.`;
  const titleRemoveFailed = t`Failed to opt out of Wisdom.`;

  let titleWillBeUsed = null;
  let titleWillNotBeUsed = null;

  const name = props.reference;

  if (props.scope == 'namespace') {
    titleWillBeUsed = (
      <Trans>
        Namespace <b>{name}</b> is opted in to Wisdom.
      </Trans>
    );
    titleWillNotBeUsed = (
      <Trans>
        Namespace <b>{name}</b> is opted out of Wisdom.
      </Trans>
    );
  }

  if (props.scope == 'legacy_namespace') {
    titleWillBeUsed = (
      <Trans>
        Legacy namespace <b>{name}</b> is opted in to Wisdom.
      </Trans>
    );
    titleWillNotBeUsed = (
      <Trans>
        Legacy namespace <b>{name}</b> is opted out of Wisdom.
      </Trans>
    );
  }

  useEffect(() => {
    wisdomDenyIndexAPI
      .isInDenyIndex(props.scope, props.reference)
      .then((result) => {
        setIsInDenyIndex(result);
        setLoading(false);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: t`Failed to load Wisdom information.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
  }, []);

  const addAlert = (alert: AlertType) => {
    setAlerts([...alerts, alert]);
  };

  const closeAlert = () => {
    setAlerts([]);
  };

  const finishAction = (isInDenyIndex) => {
    props.closeAction();

    if (props.addAlert) {
      let alert = '';
      if (isInDenyIndex) {
        alert = titleWillNotBeUsed;
      } else {
        alert = titleWillBeUsed;
      }

      props.addAlert({
        title: alert,
      });
    }
  };

  const removeFromDenyIndex = () => {
    setLoading(true);
    wisdomDenyIndexAPI
      .removeFromDenyIndex(props.scope, props.reference)
      .then(() => {
        finishAction(false);
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
      .then(() => {
        finishAction(true);
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

  const actions = [];

  if (!loading) {
    if (isInDenyIndex) {
      actions.push(
        <Button
          key='remove'
          onClick={removeFromDenyIndex}
          variant={ButtonVariant.primary}
        >
          {t`Opt in to Wisdom`}
        </Button>,
      );
    } else {
      actions.push(
        <Button
          key='add'
          onClick={addToDenyIndex}
          variant={ButtonVariant.primary}
        >
          {t`Opt out of Wisdom`}
        </Button>,
      );
    }

    actions.push(
      <Button key='add' onClick={() => props.closeAction()} variant='link'>
        {t`Cancel`}
      </Button>,
    );
  }

  return (
    <Modal
      actions={actions}
      isOpen={true}
      onClose={props.closeAction}
      title={t`Wisdom settings`}
      titleIconVariant='default'
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
            <Trans>
              Some information about Ansible Wisdom and why it is good to have
              namespaces included in the project.
            </Trans>
          </div>
        </div>
      )}
    </Modal>
  );
};
