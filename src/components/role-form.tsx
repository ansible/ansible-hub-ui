import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  ActionGroup,
  Button,
  Divider,
  Form,
  FormGroup,
  InputGroup,
  InputGroupItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { FormFieldHelper, PermissionCategories, Spinner } from 'src/components';

interface IProps {
  cancelRole: () => void;
  description: string;
  descriptionHelperText: string;
  descriptionValidated: 'default' | 'warning' | 'success' | 'error';
  isSavingDisabled: boolean;
  name: string;
  nameDisabled?: boolean;
  nameHelperText?: string;
  nameValidated?: 'default' | 'warning' | 'success' | 'error';
  onDescriptionChange: (value: string) => void;
  onNameChange?: (value: string) => void;
  originalPermissions?: string[];
  saveRole: (permissions: string[]) => void;
  saving: boolean;
}

export const RoleForm = ({
  cancelRole,
  description,
  descriptionHelperText,
  descriptionValidated,
  isSavingDisabled,
  name,
  nameDisabled,
  nameHelperText,
  nameValidated,
  onDescriptionChange,
  onNameChange,
  originalPermissions,
  saveRole,
  saving,
}: IProps) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  useEffect(() => setPermissions(originalPermissions), []);

  return (
    <>
      <Form>
        <div>
          <div style={{ paddingBottom: '8px' }}>
            <Title headingLevel='h2'>{t`Details`}</Title>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <FormGroup
              isRequired
              key='name'
              fieldId='name'
              label={t`Name`}
              style={{ width: '50%', float: 'left' }}
            >
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    id='role_name'
                    isDisabled={nameDisabled}
                    value={name}
                    onChange={(_event, value) => onNameChange(value)}
                    type='text'
                    validated={nameValidated}
                    placeholder={t`Role name`}
                  />
                </InputGroupItem>
              </InputGroup>
              <FormFieldHelper variant={nameValidated}>
                {nameHelperText}
              </FormFieldHelper>
            </FormGroup>

            <FormGroup
              isRequired
              style={{ width: '50%' }}
              key='description'
              fieldId='description'
              label={t`Description`}
            >
              <TextInput
                id='role_description'
                value={description}
                onChange={(_event, value) => onDescriptionChange(value)}
                type='text'
                validated={descriptionValidated}
                placeholder={t`Add a role description here`}
              />
              <FormFieldHelper variant={descriptionValidated}>
                {descriptionHelperText}
              </FormFieldHelper>
            </FormGroup>
          </div>
        </div>
        <div>
          <br />
          <Divider />
          <br />
          <Title headingLevel='h2'>
            <Trans>Permissions</Trans>
          </Title>

          <PermissionCategories
            permissions={permissions}
            setSelected={(permissions) => setPermissions(permissions)}
            showEmpty
          />
        </div>

        <ActionGroup>
          <Button
            variant='primary'
            isDisabled={isSavingDisabled}
            onClick={() => saveRole(permissions)}
          >
            {t`Save`}
          </Button>

          <Button variant='secondary' onClick={cancelRole}>{t`Cancel`}</Button>
          {saving ? <Spinner /> : null}
        </ActionGroup>
      </Form>
    </>
  );
};
