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
  numberOfAffected: number;
  isOpen: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const SignAllCertificatesModal: React.FC<Props> = ({
  name,
  numberOfAffected,
  isOpen,
  onSubmit,
  onCancel,
}) => (
  <Modal
    variant={ModalVariant.medium}
    title={t`Sign all collections`}
    isOpen={isOpen}
    onClose={onCancel}
    actions={[
      <Button key='sign-all' variant={ButtonVariant.primary} onClick={onSubmit}>
        {t`Sign all`}
      </Button>,
      <Button key='cancel' variant={ButtonVariant.link} onClick={onCancel}>
        {t`Cancel`}
      </Button>,
    ]}
  >
    <p>
      <Trans>
        You are about to sign <strong>all</strong> versions under{' '}
        <strong>{name}</strong>.
      </Trans>
    </p>
    <br />
    <p>
      <Trans>
        This action will affect <strong>{numberOfAffected}</strong> versions.
      </Trans>
    </p>
  </Modal>
);

export default SignAllCertificatesModal;
