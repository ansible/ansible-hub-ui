import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Button,
  ButtonVariant,
  ExpandableSection,
  Modal,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { AIDenyIndexAPI } from 'src/api';
import {
  AlertList,
  type AlertType,
  ExternalLink,
  Spinner,
  closeAlert,
} from 'src/components';
import { jsxErrorMessage } from 'src/utilities';

interface IProps {
  scope: 'namespace' | 'legacy_namespace';
  reference: string;
  closeAction: () => void;
  addAlert: (alert) => void;
}

export const LightspeedModal = (props: IProps) => {
  const [isInDenyIndex, setIsInDenyIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  let titleWillBeUsed = null;
  let titleWillNotBeUsed = null;

  let areYouSureToOptIn = null;
  let areYouSureToOptOut = null;

  const name = props.reference;

  if (props.scope == 'namespace') {
    titleWillBeUsed = (
      <Trans>
        Namespace <b>{name}</b> is opted in to Ansible Lightspeed.
      </Trans>
    );
    titleWillNotBeUsed = (
      <Trans>
        Namespace <b>{name}</b> is opted out of Ansible Lightspeed.
      </Trans>
    );
    areYouSureToOptIn = (
      <Trans>
        The following namespace will be opted in to Ansible Lightspeed:
      </Trans>
    );
    areYouSureToOptOut = (
      <Trans>
        Are you sure you want to opt the following namespace out of Ansible
        Lightspeed?
      </Trans>
    );
  }

  if (props.scope == 'legacy_namespace') {
    titleWillBeUsed = (
      <Trans>
        Legacy namespace <b>{name}</b> is opted in to Ansible Lightspeed.
      </Trans>
    );
    titleWillNotBeUsed = (
      <Trans>
        Legacy namespace <b>{name}</b> is opted out of Ansible Lightspeed.
      </Trans>
    );
    areYouSureToOptIn = (
      <Trans>
        The following legacy namespace will be opted in to Ansible Lightspeed:
      </Trans>
    );
    areYouSureToOptOut = (
      <Trans>
        Are you sure you want to opt the following legacy namespace out of
        Ansible Lightspeed?
      </Trans>
    );
  }

  useEffect(() => {
    setIsInDenyIndex(null);
    setLoading(true);

    AIDenyIndexAPI.isInDenyIndex(props.scope, props.reference)
      .then((result) => {
        setIsInDenyIndex(result);
        setLoading(false);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: t`Failed to load Ansible Lightspeed information.`,
          variant: 'danger',
          description: jsxErrorMessage(status, statusText),
        });
      });
  }, [props.scope, props.reference]);

  const addAlert = (alert: AlertType) => {
    setAlerts([...alerts, alert]);
  };

  const finishAction = (isInDenyIndex) => {
    props.closeAction();

    if (props.addAlert) {
      props.addAlert({
        title: isInDenyIndex ? titleWillNotBeUsed : titleWillBeUsed,
        variant: 'success',
      });
    }
  };

  const removeFromDenyIndex = () => {
    setLoading(true);
    AIDenyIndexAPI.removeFromDenyIndex(props.scope, props.reference)
      .then(() => {
        finishAction(false);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: t`Failed to opt in to Ansible Lightspeed.`,
          variant: 'danger',
          description: jsxErrorMessage(status, statusText),
        });
        setLoading(false);
      });
  };

  const addToDenyIndex = () => {
    setLoading(true);
    AIDenyIndexAPI.addToDenyIndex(props.scope, props.reference)
      .then(() => {
        finishAction(true);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: t`Failed to opt out of Ansible Lightspeed.`,
          variant: 'danger',
          description: jsxErrorMessage(status, statusText),
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
          {t`Opt in to Ansible Lightspeed`}
        </Button>,
      );
    } else {
      actions.push(
        <Button
          key='add'
          onClick={addToDenyIndex}
          variant={ButtonVariant.primary}
        >
          {t`Opt out of Ansible Lightspeed`}
        </Button>,
      );
    }

    actions.push(
      <Button key='close' onClick={() => props.closeAction()} variant='link'>
        {t`Cancel`}
      </Button>,
    );
  }

  const expandableTitle = t`Additional details`;
  return (
    <Modal
      actions={actions}
      isOpen
      onClose={props.closeAction}
      title={
        loading
          ? t`Ansible Lightspeed settings`
          : isInDenyIndex
            ? t`Opt in to Ansible Lightspeed`
            : t`Opt out of Ansible Lightspeed`
      }
      variant='small'
      titleIconVariant={isInDenyIndex ? null : 'warning'}
    >
      <AlertList
        alerts={alerts}
        closeAlert={(i) => closeAlert(i, { alerts, setAlerts })}
      />
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <div>
            <Trans>
              <p>
                Red Hat is working on exciting new Ansible content development
                capabilities within the context of{' '}
                <ExternalLink href='https://www.redhat.com/en/technologies/management/ansible/ansible-lightspeed'>
                  Ansible Lightspeed
                </ExternalLink>{' '}
                to help other automators build Ansible content.
              </p>
            </Trans>
            <br />
            <ExpandableSection
              toggleTextExpanded={expandableTitle}
              toggleTextCollapsed={expandableTitle}
            >
              <div>
                <Trans>
                  <p>
                    Your roles and collections may be used as training data for
                    a machine learning model that provides Ansible automation
                    content recommendations.
                  </p>
                  <p>
                    If you have concerns, please contact the Ansible team at{' '}
                    <a href='mailto:ansible-content-ai@redhat.com'>
                      ansible-content-ai@redhat.com
                    </a>
                    .
                  </p>
                </Trans>
              </div>
            </ExpandableSection>
          </div>
          <br />
          <div>
            {!loading && isInDenyIndex ? areYouSureToOptIn : areYouSureToOptOut}
          </div>
          <br />
          {props.reference}
        </div>
      )}
    </Modal>
  );
};
