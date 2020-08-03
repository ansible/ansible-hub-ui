import * as React from 'react';

import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
} from '@patternfly/react-core';

import { UserType } from '../../api';

interface IProps {
  /** User to edit */
  user: UserType;

  /** Updates the current user object with the new user object */
  updateUser: (user: UserType, errorMesssages: object) => void;

  /** List of errors from the API */
  errorMessages: object;

  /** List of fields to mark as required */
  requiredFields?: string[];

  /** Disables the form */
  isReadonly?: boolean;

  /** Saves the current user */
  saveUser?: () => void;

  /** Action to take when the user presses the cancel button */
  onCancel?: () => void;
}

interface IState {
  passwordConfirm: string;
}

export class UserForm extends React.Component<IProps, IState> {
  public static defaultProps = {
    isReadonly: false,
    requiredFields: ['username', 'password'],
  };

  constructor(props) {
    super(props);

    this.state = {
      passwordConfirm: '',
    };
  }

  render() {
    const {
      user,
      errorMessages,
      isReadonly,
      saveUser,
      onCancel,
      requiredFields,
    } = this.props;
    const { passwordConfirm } = this.state;
    const formFields = [
      { id: 'first_name', title: 'First name' },
      { id: 'last_name', title: 'Last name' },
      { id: 'email', title: 'Email' },
      { id: 'username', title: 'Username' },
      {
        id: 'password',
        title: 'Password',
        type: 'password',
        placeholder: '••••••••••••••••••••••',
      },
    ];
    return (
      <Form>
        {formFields.map(v => (
          <FormGroup
            isRequired={requiredFields.includes(v.id)}
            key={v.id}
            fieldId={v.id}
            label={v.title}
            validated={this.toError(!(v.id in errorMessages))}
            helperTextInvalid={errorMessages[v.id]}
          >
            <TextInput
              validated={this.toError(!(v.id in errorMessages))}
              isDisabled={isReadonly}
              id={v.id}
              placeholder={v.placeholder}
              value={user[v.id]}
              onChange={this.updateField}
              type={(v.type as any) || 'text'}
            />
          </FormGroup>
        ))}
        <FormGroup
          fieldId={'password-confirm'}
          label={'Password confirmation'}
          helperTextInvalid={'Passwords do not match'}
          validated={this.toError(
            this.isPassSame(user.password, passwordConfirm),
          )}
        >
          <TextInput
            validated={this.toError(
              this.isPassSame(user.password, passwordConfirm),
            )}
            isDisabled={isReadonly}
            id={'password-confirm'}
            value={passwordConfirm}
            onChange={value => {
              this.setState({ passwordConfirm: value });
            }}
            type='password'
          />
        </FormGroup>
        {!isReadonly && (
          <ActionGroup>
            <Button
              isDisabled={
                !this.isPassSame(user.password, passwordConfirm) ||
                !this.requiredFilled(user)
              }
              onClick={() => saveUser()}
            >
              Save
            </Button>
            <Button onClick={() => onCancel()} variant='link'>
              Cancel
            </Button>
          </ActionGroup>
        )}
      </Form>
    );
  }

  private toError(validated: boolean) {
    if (validated) {
      return 'default';
    } else {
      return 'error';
    }
  }

  private isPassSame(pass, confirm) {
    return !pass || pass === '' || pass === confirm;
  }

  private requiredFilled(user) {
    return !!user.password && !!user.username;
  }

  private updateField = (value, event) => {
    const update = { ...this.props.user };
    const errorMessages = { ...this.props.errorMessages };
    update[event.target.id] = value;
    if (event.target.id in errorMessages) {
      delete errorMessages[event.target.id];
    }
    this.props.updateUser(update, errorMessages);
  };
}
