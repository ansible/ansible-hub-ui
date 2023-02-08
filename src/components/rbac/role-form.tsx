import { i18n } from '@lingui/core';
import { Trans, t } from '@lingui/macro';
import {
  ActionGroup,
  Button,
  Divider,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  InputGroup,
  Spinner,
  TextInput,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { PermissionChipSelector } from 'src/components';
import { Constants } from 'src/constants';
import { twoWayMapper } from 'src/utilities';

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
    const { permissions: selectedPermissions } = this.state;
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
    const groups = Constants.PERMISSIONS;

    const filteredPermissions = { ...Constants.HUMAN_PERMISSIONS };

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
                    placeholder={t`Role name`}
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
                  placeholder={t`Add a role description here`}
                />
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

            {groups.map((group) => (
              <Flex
                style={{ marginTop: '16px' }}
                alignItems={{ default: 'alignItemsCenter' }}
                key={group.name}
                className={group.name}
                data-cy={`RoleForm-Permissions-row-${group.name}`}
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
                      .map((value) => twoWayMapper(value, filteredPermissions))
                      .sort()}
                    selectedPermissions={selectedPermissions
                      .filter((selected) =>
                        group.object_permissions.find(
                          (perm) => selected === perm,
                        ),
                      )
                      .map((value) => twoWayMapper(value, filteredPermissions))}
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
                          twoWayMapper(selection, filteredPermissions),
                        )
                      ) {
                        newPerms.delete(
                          twoWayMapper(selection, filteredPermissions),
                        );
                      } else {
                        newPerms.add(
                          twoWayMapper(selection, filteredPermissions),
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
}
