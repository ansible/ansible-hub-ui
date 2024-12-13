import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { type FunctionComponent } from 'react';

interface IProps {
  name: string;
  version: string;
  isOpen: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const SignSingleCertificateModal: FunctionComponent<IProps> = ({
  name,
  version,
  isOpen,
  onSubmit,
  onCancel,
}) => (
  <Modal
    variant={ModalVariant.medium}
    title={t`Sign version ${version}`}
    isOpen={isOpen}
    onClose={onCancel}
    actions={[
      <Button
        key='sign'
        data-cy='modal-sign-button'
        variant={ButtonVariant.primary}
        onClick={onSubmit}
      >
        {t`Sign`}
      </Button>,
      <Button key='cancel' variant={ButtonVariant.link} onClick={onCancel}>
        {t`Cancel`}
      </Button>,
    ]}
  >
    <p>
      <Trans>
        You are about to sign <strong>version {version}</strong> under{' '}
        <strong>{name}</strong>.
      </Trans>
    </p>
  </Modal>
);
