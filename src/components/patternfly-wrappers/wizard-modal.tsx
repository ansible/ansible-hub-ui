import { t } from '@lingui/macro';
import {
  Modal,
  ModalVariant,
  Wizard as PFWizard,
  WizardStep,
} from '@patternfly/react-core';
import React from 'react';

interface Props {
  steps: WizardStep[];
  title: string;
  variant?: ModalVariant;
  onClose: () => void;
  onSave: () => void;
}

export const WizardModal = ({
  steps,
  title,
  onClose,
  onSave,
  variant,
}: Props) => (
  <Modal
    isOpen
    variant={variant ?? ModalVariant.large}
    showClose={false}
    aria-label={title}
    hasNoBodyWrapper
  >
    <PFWizard
      hasNoBodyPadding
      navAriaLabel={t`${title} steps`}
      mainAriaLabel={t`${title} content`}
      titleId='wizard-modal-title'
      descriptionId='wizard-modal-description'
      title={title}
      steps={steps}
      onClose={onClose}
      onSave={onSave}
    />
  </Modal>
);
