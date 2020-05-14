import * as React from 'react';

import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import { UserType } from '../../api';

interface IProps {
  /** User to edit */
  user: UserType;

  /** Updates the current user object with the new user object */
  updateUser: (user: UserType) => void;

  /** List of errors from the API */
  errorMessages: { [key: string]: string };

  /** List of fields to mark as required */
  requiredFields?: string[];
}

export class UserForm extends React.Component<IProps> {
  render() {
    const { user, errorMessages } = this.props;
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
            key={v.id}
            fieldId={v.id}
            label={v.title}
            helperTextInvalid={errorMessages[v.id]}
            isValid={!(v.id in errorMessages)}
          >
            <TextInput
              id={v.id}
              value={user[v.id]}
              onChange={this.updateField}
              type={(v.type as any) || 'text'}
            />
          </FormGroup>
        ))}
      </Form>
    );
  }

  private updateField = (value, event) => {
    // console.log(value);
    // console.log(event);
    const update = { ...this.props.user };
    update[event.target.id] = value;
    this.props.updateUser(update);
  };
}
