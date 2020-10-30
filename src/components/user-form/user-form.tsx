import * as React from 'react';

import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
} from '@patternfly/react-core';

import { APISearchTypeAhead } from '../../components';

import { UserType, GroupAPI } from '../../api';

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
  isNewUser?: boolean;
  isMe?: boolean;
}

interface IState {
  passwordConfirm: string;
  searchGroups: any[];
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
      searchGroups: [],
    };
  }

  componentDidMount() {
    this.loadGroups('');
  }

  render() {
    const {
      user,
      errorMessages,
      isReadonly,
      saveUser,
      onCancel,
      requiredFields,
      isNewUser,
      isMe,
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
        placeholder: isNewUser ? '' : '••••••••••••••••••••••',
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
            placeholder={isNewUser ? '' : '••••••••••••••••••••••'}
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
        <FormGroup
          fieldId='groups'
          label='Groups'
          helperTextInvalid={errorMessages['groups']}
          validated={this.toError(!('groups' in errorMessages))}
        >
          <APISearchTypeAhead
            results={this.state.searchGroups}
            loadResults={this.loadGroups}
            onSelect={this.onSelectGroup}
            placeholderText='Select groups'
            selections={user.groups}
            multiple={true}
            onClear={this.clearGroups}
            isDisabled={isReadonly || isMe}
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

  private clearGroups = () => {
    const newUser = { ...this.props.user };
    newUser.groups = [];
    this.props.updateUser(newUser, this.props.errorMessages);
  };

  private onSelectGroup = (event, selection, isPlaceholder) => {
    const { user } = this.props;

    const newUser = { ...user };

    const i = user.groups.findIndex(g => g.name === selection);
    if (i === -1) {
      const addedGroup = this.state.searchGroups.find(
        g => g.name === selection,
      );
      user.groups.push(addedGroup);
    } else {
      user.groups.splice(i, 1);
    }

    this.props.updateUser(newUser, this.props.errorMessages);
  };

  private loadGroups = name => {
    GroupAPI.list({ name__contains: name, page_size: 5 }).then(result =>
      this.setState({ searchGroups: result.data.data }),
    );
  };

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
    if (this.props.isNewUser) {
      return !!user.password && !!user.username;
    } else {
      return !!user.username;
    }
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
