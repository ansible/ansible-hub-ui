import { t } from '@lingui/macro';
import {
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';
import React, { type ReactNode } from 'react';

interface Props {
  onClose: () => void;
  onSave: () => void;
  steps: {
    children: ReactNode;
    id: string | number;
    isDisabled?: boolean;
    name: string;
  }[];
  title: string;
}

export const WizardModal = ({ onClose, onSave, steps, title }: Props) => {
  const footer = {
    backButtonText: t`Back`,
    cancelButtonText: t`Cancel`,
    nextButtonText: t`Next`,
  };

  return (
    <Modal
      aria-label={title}
      hasNoBodyWrapper
      isOpen
      onEscapePress={onClose}
      showClose={false}
      variant={ModalVariant.large}
    >
      <Wizard
        header={
          <WizardHeader
            closeButtonAriaLabel={t`Close`}
            onClose={onClose}
            title={title}
          />
        }
        navAriaLabel={t`${title} steps`}
        onClose={onClose}
        onSave={onSave}
      >
        {steps.map((step, i, { [i + 1]: next, length }) =>
          i === length - 1 ? (
            <WizardStep
              key={step.id}
              {...step}
              footer={{ ...footer, nextButtonText: t`Add` }}
            />
          ) : (
            <WizardStep
              key={step.id}
              {...step}
              footer={{ ...footer, isNextDisabled: next.isDisabled }}
            />
          ),
        )}
      </Wizard>
    </Modal>
  );
};
