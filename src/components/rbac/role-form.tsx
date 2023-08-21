import { Trans, t } from '@lingui/macro';
import {
  ActionGroup,
  Button,
  Divider,
  Form,
  FormGroup,
  InputGroup,
  InputGroupItem,
  Spinner,
  TextInput,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import { FormFieldHelper, PermissionCategories } from 'src/components';

interface IState {
  permissions: string[];
}

interface IProps {
  nameDisabled?: boolean;
  name: string;
  description: string;
  onNameChange?: (value: string) => void;
  nameValidated?: 'default' | 'warning' | 'success' | 'error';
  nameHelperText?: string;
  descriptionValidated: 'default' | 'warning' | 'success' | 'error';
  descriptionHelperText: string;
  onDescriptionChange: (value: string) => void;
  saveRole: (permissions: string[]) => void;
  cancelRole: () => void;
  isSavingDisabled: boolean;
  saving: boolean;
  originalPermissions?: string[];
}

export class RoleForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      permissions: [],
    };
  }

  componentDidMount() {
    if (this.props.originalPermissions) {
      this.setState({ permissions: this.props.originalPermissions });
    }
  }

  render() {
    const { permissions } = this.state;
    const {
      name,
      onNameChange,
      nameValidated,
      nameHelperText,
      description,
      descriptionValidated,
      descriptionHelperText,
      onDescriptionChange,
      saveRole,
      cancelRole,
      nameDisabled,
      isSavingDisabled,
      saving,
    } = this.props;

    return (
      <React.Fragment>
        <Form>
          <div>
            <div style={{ paddingBottom: '8px' }}>
              <Title headingLevel='h2'>{t`Details`}</Title>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <FormGroup
                isRequired={true}
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
                isRequired={true}
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
              setSelected={(permissions) => this.setState({ permissions })}
              showCustom={false}
              showEmpty={true}
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

            <Button
              variant='secondary'
              onClick={cancelRole}
            >{t`Cancel`}</Button>
            {saving ? <Spinner /> : null}
          </ActionGroup>
        </Form>
      </React.Fragment>
    );
  }
}
