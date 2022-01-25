import { t, Trans } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import React from 'react';

interface Props {
  name: string;
  version: string;
  isOpen: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const SignSingleCertificateModal: React.FC<Props> = ({
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
      <Button key='sign' variant={ButtonVariant.primary} onClick={onSubmit}>
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

export default SignSingleCertificateModal;
