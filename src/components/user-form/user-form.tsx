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
  updateUser: (user: UserType) => void;

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
      { id: 'password', title: 'Password', type: 'password' },
    ];
    return (
      <Form>
        {formFields.map(v => (
          <FormGroup
            isRequired={requiredFields.includes(v.id)}
            key={v.id}
            fieldId={v.id}
            label={v.title}
            helperTextInvalid={errorMessages[v.id]}
            isValid={!(v.id in errorMessages)}
          >
            <TextInput
              isDisabled={isReadonly}
              id={v.id}
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
          isValid={user.password == '' || user.password === passwordConfirm}
        >
          <TextInput
            isDisabled={isReadonly}
            id={'password-confirm'}
            value={passwordConfirm}
            onChange={(value, event) => {
              this.setState({ passwordConfirm: value });
            }}
            type='password'
          />
        </FormGroup>

        {!isReadonly && (
          <ActionGroup>
            <Button
              isDisabled={
                !(user.password == '' || user.password === passwordConfirm)
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

  private updateField = (value, event) => {
    const update = { ...this.props.user };
    update[event.target.id] = value;
    this.props.updateUser(update);
  };
}
