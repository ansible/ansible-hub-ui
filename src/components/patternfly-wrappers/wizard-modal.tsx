import React from 'react';
import {
  Modal,
  ModalVariant,
  Wizard as PFWizard,
} from '@patternfly/react-core';

interface Props {
  steps: any;
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
      navAriaLabel={`${title} steps`}
      mainAriaLabel={`${title} content`}
      titleId='wiz-modal-demo-title'
      descriptionId='wiz-modal-demo-description'
      title={title}
      steps={steps}
      onClose={onClose}
      onSave={onSave}
    />
  </Modal>
);
