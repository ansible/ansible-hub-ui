import { Trans, t } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  ExpandableSection,
  Modal,
  Spinner,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import React, { useEffect, useState } from 'react';
import { WisdomDenyIndexAPI } from 'src/api';
import { AlertList, AlertType, closeAlert } from 'src/components';
import { errorMessage } from 'src/utilities';

interface IProps {
  scope: 'namespace' | 'legacy_namespace';
  reference: string;
  closeAction: () => void;
  addAlert: (alert) => void;
}

export const WisdomModal = (props: IProps) => {
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
        Namespace <b>{name}</b> is opted in to Wisdom.
      </Trans>
    );
    titleWillNotBeUsed = (
      <Trans>
        Namespace <b>{name}</b> is opted out of Wisdom.
      </Trans>
    );
    areYouSureToOptIn = (
      <Trans>
        Are you sure you want to opt the following namespace in to Wisdom?
      </Trans>
    );
    areYouSureToOptOut = (
      <Trans>
        Are you sure you want to opt the following namespace out of Wisdom?
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
    areYouSureToOptIn = (
      <Trans>
        Are you sure you want to opt the following legacy namespace in to
        Wisdom?
      </Trans>
    );
    areYouSureToOptOut = (
      <Trans>
        Are you sure you want to opt the following legacy namespace out of
        Wisdom?
      </Trans>
    );
  }

  useEffect(() => {
    setIsInDenyIndex(null);
    setLoading(true);

    WisdomDenyIndexAPI.isInDenyIndex(props.scope, props.reference)
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
    WisdomDenyIndexAPI.removeFromDenyIndex(props.scope, props.reference)
      .then(() => {
        finishAction(false);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: t`Failed to opt in to Wisdom.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
        setLoading(false);
      });
  };

  const addToDenyIndex = () => {
    setLoading(true);
    WisdomDenyIndexAPI.addToDenyIndex(props.scope, props.reference)
      .then(() => {
        finishAction(true);
      })
      .catch(({ response: { status, statusText } }) => {
        addAlert({
          title: t`Failed to opt out of Wisdom.`,
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
      <Button key='close' onClick={() => props.closeAction()} variant='link'>
        {t`Cancel`}
      </Button>,
    );
  }

  const expandableTitle = t`Learn more about Ansible Wisdom.`;
  return (
    <Modal
      actions={actions}
      isOpen={true}
      onClose={props.closeAction}
      title={
        loading
          ? t`Wisdom settings`
          : isInDenyIndex
          ? t`Opt in to Wisdom`
          : t`Opt out of Wisdom`
      }
      variant='small'
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
            {!loading && isInDenyIndex ? areYouSureToOptIn : areYouSureToOptOut}
          </div>
          <br />
          <div>
            <ExpandableSection
              toggleTextExpanded={expandableTitle}
              toggleTextCollapsed={expandableTitle}
            >
              <div>
                <Trans>
                  <p>
                    Red Hat is working on exciting new Ansible content
                    development capabilities within the context of{' '}
                    <a
                      href='https://www.redhat.com/en/engage/project-wisdom'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Project Wisdom
                    </a>{' '}
                    <ExternalLinkAltIcon /> to help other automators build
                    Ansible content.
                  </p>
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
        </div>
      )}
    </Modal>
  );
};
