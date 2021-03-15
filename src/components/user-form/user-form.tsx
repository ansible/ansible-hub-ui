import * as React from 'react';

import {
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
  Chip,
  ChipGroup,
  Label,
  Tooltip,
} from '@patternfly/react-core';
import { UserPlusIcon } from '@patternfly/react-icons';

import { APISearchTypeAhead, HelperText } from 'src/components';
import { DataForm } from 'src/components/shared/data-form';

import { UserType, GroupAPI } from 'src/api';

interface IProps {
  /** User to edit */
  user: UserType;

  /** Updates the current user object with the new user object */
  updateUser: (user: UserType, errorMesssages: object) => void;

  /** List of errors from the API */
  errorMessages: object;

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
        formGroupLabelIcon: (
          <HelperText
            content={
              'Create a password using at least 9 characters, including special characters , ex <!@$%>. Avoid using common names or expressions.'
            }
          />
        ),
      },
    ];
    const requiredFields = ['username', ...(isNewUser ? ['password'] : [])];

    const passwordConfirmGroup = (
      <FormGroup
        fieldId={'password-confirm'}
        label={'Password confirmation'}
        helperTextInvalid={'Passwords do not match'}
        isRequired={isNewUser || !!user.password}
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
    );

    const readonlyGroups = (
      <FormGroup fieldId={'groups'} label={'Groups'}>
        {user.groups.length !== 0 && (
          <ChipGroup>
            {' '}
            {user.groups.map(group => (
              <Chip isReadOnly cellPadding={'1px'}>
                {group.name}
              </Chip>
            ))}{' '}
          </ChipGroup>
        )}
      </FormGroup>
    );

    const editGroups = (
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
          isDisabled={isReadonly}
        />
      </FormGroup>
    );

    const superuserLabel = (
      <FormGroup fieldId='is_superuser' label='User type'>
        <Tooltip content='Super users have all system permissions regardless of what groups they are in.'>
          <Label icon={<UserPlusIcon />} color='orange'>
            Super user
          </Label>
        </Tooltip>
      </FormGroup>
    );

    const formButtons = (
      <ActionGroup>
        <Button
          isDisabled={
            !this.isPassValid(user.password, passwordConfirm) ||
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
    );

    const formSuffix = [
      passwordConfirmGroup,
      isMe ? readonlyGroups : editGroups,
      user.is_superuser && superuserLabel,
      !isReadonly && formButtons,
    ];

    return (
      <DataForm
        errorMessages={errorMessages}
        formFields={formFields}
        formSuffix={<>{formSuffix}</>}
        isReadonly={isReadonly}
        model={user}
        requiredFields={requiredFields}
        updateField={(v, e) => this.updateField(v, e)}
      />
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

  // confirm is empty, or matches password
  private isPassSame(pass, confirm) {
    return !confirm || pass === confirm;
  }

  // both passwords missing, or both match
  private isPassValid(pass, confirm) {
    return !(pass || confirm) || pass === confirm;
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
