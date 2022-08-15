import { t, Trans } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import React from 'react';

interface Props {
  name: string;
  isOpen: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const SignAllCertificatesModal: React.FC<Props> = ({
  name,
  isOpen,
  onSubmit,
  onCancel,
}) => {
  return (
    <Modal
      variant={ModalVariant.medium}
      title={t`Sign all collections`}
      isOpen={isOpen}
      onClose={onCancel}
      actions={[
        <Button
          key='sign-all'
          data-cy='modal-sign-button'
          variant={ButtonVariant.primary}
          onClick={onSubmit}
        >
          {t`Sign all`}
        </Button>,
        <Button key='cancel' variant={ButtonVariant.link} onClick={onCancel}>
          {t`Cancel`}
        </Button>,
      ]}
    >
      <Grid hasGutter>
        <GridItem span={12}>
          <p>
            <Trans>
              You are about to sign <strong>all versions</strong> under{' '}
              <strong>{name}</strong>.
            </Trans>
          </p>
        </GridItem>
        <GridItem span={12}>
          <Split hasGutter>
            <SplitItem>
              <Trans>Signed version(s)</Trans>
            </SplitItem>
            <SplitItem></SplitItem>
            <SplitItem>
              <Trans>Unsigned version(s)</Trans>
            </SplitItem>
          </Split>
        </GridItem>
        <GridItem span={12}>
          <Form>
            <FormGroup
              fieldId='service-selector'
              label={t`Signing service selector:`}
            >
              <FormSelect value='ansible-default' id='service-selector'>
                <FormSelectOption
                  value='ansible-default'
                  label='ansible-default'
                />
              </FormSelect>
            </FormGroup>
          </Form>
        </GridItem>
      </Grid>
    </Modal>
  );
};
