import { t } from '@lingui/macro';
import {
  ActionGroup,
  Button,
  Divider,
  Form,
  FormGroup,
  InputGroup,
  Spinner,
  TextInput,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { PermissionCategories } from 'src/components';

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
                helperTextInvalid={nameHelperText}
                validated={nameValidated}
              >
                <InputGroup>
                  <TextInput
                    id='role_name'
                    isDisabled={nameDisabled}
                    value={name}
                    onChange={onNameChange}
                    type='text'
                    validated={nameValidated}
                    placeholder='Role name'
                  />
                </InputGroup>
              </FormGroup>

              <FormGroup
                isRequired={true}
                style={{ width: '50%' }}
                key='description'
                fieldId='description'
                label={t`Description`}
                helperTextInvalid={descriptionHelperText}
                validated={descriptionValidated}
              >
                <TextInput
                  id='role_description'
                  value={description}
                  onChange={onDescriptionChange}
                  type='text'
                  validated={descriptionValidated}
                  placeholder='Add a role description here'
                />
              </FormGroup>
            </div>
          </div>
          <div>
            <br />
            <Divider />
            <br />
            <Title headingLevel='h2'>Permissions</Title>

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
            {saving ? <Spinner></Spinner> : null}
          </ActionGroup>
        </Form>
      </React.Fragment>
    );
  }
}
