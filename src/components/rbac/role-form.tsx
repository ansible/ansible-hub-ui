import { t } from '@lingui/macro';
import * as React from 'react';
import { i18n } from '@lingui/core';
import { PermissionChipSelector } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { PermissionType } from 'src/api';
import {
  ActionGroup,
  Button,
  Flex,
  FlexItem,
  Form,
  TextInput,
  InputGroup,
  FormGroup,
  Title,
  Divider,
  Spinner,
} from '@patternfly/react-core';

interface IState {
  permissions: string[];
  groups: PermissionType[];
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
  static contextType = AppContext;
  constructor(props) {
    super(props);
    this.state = {
      permissions: [],
      groups: [],
    };
  }

  componentDidMount() {
    const { model_permissions } = this.context.user;
    if (this.props.originalPermissions) {
      this.setState({
        permissions: this.props.originalPermissions,
      });
    }
    this.setState({ groups: this.formatPermissions(model_permissions) });
  }

  render() {
    const { permissions: selectedPermissions, groups } = this.state;
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

    const { model_permissions } = this.context.user;

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

            {groups.map((group) => (
              <Flex
                style={{ marginTop: '16px' }}
                alignItems={{ default: 'alignItemsCenter' }}
                key={group.label}
                className={group.label}
                data-cy={`RoleForm-Permissions-row-${group.label}`}
              >
                <FlexItem style={{ minWidth: '200px' }}>
                  {i18n._(group.label)}
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }}>
                  <PermissionChipSelector
                    availablePermissions={group.object_permissions
                      .filter(
                        (perm) =>
                          !selectedPermissions.find(
                            (selected) => selected === perm,
                          ),
                      )
                      .map((value) => this.getNicenames(value))
                      .sort()}
                    selectedPermissions={selectedPermissions
                      .filter((selected) =>
                        group.object_permissions.find(
                          (perm) => selected === perm,
                        ),
                      )
                      .map((value) => this.getNicenames(value))}
                    setSelected={(perms) =>
                      this.setState({ permissions: perms })
                    }
                    menuAppendTo='inline'
                    multilingual={true}
                    isViewOnly={false}
                    onClear={() => {
                      const clearedPerms = group.object_permissions;
                      this.setState({
                        permissions: this.state.permissions.filter(
                          (x) => !clearedPerms.includes(x),
                        ),
                      });
                    }}
                    onSelect={(event, selection) => {
                      const newPerms = new Set(this.state.permissions);
                      if (
                        newPerms.has(
                          this.getKeyByValue(model_permissions, selection),
                        )
                      ) {
                        newPerms.delete(
                          this.getKeyByValue(model_permissions, selection),
                        );
                      } else {
                        newPerms.add(
                          this.getKeyByValue(model_permissions, selection),
                        );
                      }
                      this.setState({
                        permissions: Array.from(newPerms),
                      });
                    }}
                  />
                </FlexItem>
              </Flex>
            ))}
          </div>

          <ActionGroup>
            <Button
              variant='primary'
              isDisabled={isSavingDisabled}
              onClick={() => saveRole(selectedPermissions)}
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

  private formatPermissions(permissions): PermissionType[] {
    const formattedPermissions = {};
    for (const [key, value] of Object.entries(permissions)) {
      if (value['ui_category'] in formattedPermissions) {
        formattedPermissions[value['ui_category']]['object_permissions'].push(
          key,
        );
      } else {
        formattedPermissions[value['ui_category']] = {
          label: value['ui_category'],
          object_permissions: [key],
        };
      }
    }
    const arrayPermissions = Object.values(
      formattedPermissions,
    ) as PermissionType[];
    return arrayPermissions;
  }

  private getNicenames(permission) {
    const { model_permissions } = this.context.user;
    if (model_permissions[permission].name !== undefined) {
      return model_permissions[permission].name;
    } else {
      return undefined;
    }
  }

  private getKeyByValue(permissions, value) {
    const permArray = Object.entries(permissions);
    let realName = '';
    permArray.map((p) => {
      if (value === p[1]['name']) {
        realName = p[0];
      }
    });
    return realName;
  }
}
