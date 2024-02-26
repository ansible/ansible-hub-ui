import { t } from '@lingui/macro';
import {
  ActionGroup,
  Alert,
  Button,
  FormGroup,
  Label,
  Switch,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';
import React, { Component } from 'react';
import { GroupAPI, UserType } from 'src/api';
import {
  APISearchTypeAhead,
  AlertType,
  DataForm,
  FormFieldHelper,
  HelperText,
} from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import { ErrorMessagesType, errorMessage } from 'src/utilities';

interface IProps {
  /** User to edit */
  user: UserType;

  /** Updates the current user object with the new user object */
  updateUser: (user: UserType, errorMesssages: object) => void;

  /** List of errors from the API */
  errorMessages: ErrorMessagesType;

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
  searchGroups: { name: string; id: number }[];
  formErrors: {
    groups: AlertType;
  };
}

export class UserForm extends Component<IProps, IState> {
  public static defaultProps = {
    isReadonly: false,
  };
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = {
      passwordConfirm: '',
      searchGroups: [],
      formErrors: {
        groups: null,
      },
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
    const { passwordConfirm, formErrors } = this.state;
    const minLength =
      (this.context as IAppContextType).settings
        .GALAXY_MINIMUM_PASSWORD_LENGTH || 9; // actually counts codepoints, close enough

    const formFields = [
      { id: 'username', title: t`Username` },
      { id: 'first_name', title: t`First name` },
      { id: 'last_name', title: t`Last name` },
      { id: 'email', title: t`Email` },
      !isReadonly && {
        id: 'password',
        title: t`Password`,
        type: 'password',
        placeholder: isNewUser ? '' : '••••••••••••••••••••••',
        formGroupLabelIcon: (
          <HelperText
            content={t`Create a password using at least ${minLength} characters, including special characters , ex <!@$%>. Avoid using common names or expressions.`}
          />
        ),
      },
    ];
    const requiredFields = ['username', ...(isNewUser ? ['password'] : [])];

    const passwordConfirmGroup = () => (
      <FormGroup
        fieldId='password-confirm'
        isRequired={isNewUser || !!user.password}
        key='confirm-group'
        label={t`Password confirmation`}
      >
        <TextInput
          placeholder={isNewUser ? '' : '••••••••••••••••••••••'}
          validated={
            this.samePass(user.password, passwordConfirm) ? 'default' : 'error'
          }
          isDisabled={isReadonly}
          id='password-confirm'
          value={passwordConfirm}
          onChange={(_event, value) => {
            this.setState({ passwordConfirm: value });
          }}
          type='password'
          autoComplete='off'
        />
        <FormFieldHelper
          variant={
            this.samePass(user.password, passwordConfirm) ? 'default' : 'error'
          }
        >
          {t`Passwords do not match`}
        </FormFieldHelper>
      </FormGroup>
    );

    const readonlyAuth = () => (
      <FormGroup
        fieldId='auth_provider'
        key='readonlyAuth'
        label={t`Authentication provider`}
      >
        {user.auth_provider.map((provider) => (
          <Label key={provider}>{provider}</Label>
        ))}
      </FormGroup>
    );

    const readonlyGroups = () => (
      <FormGroup
        fieldId='groups'
        key='readonlyGroups'
        label={t`Groups`}
        data-cy='UserForm-readonly-groups'
      >
        {user.groups.map((group) => (
          <Label key={group.name}>{group.name}</Label>
        ))}
      </FormGroup>
    );

    const editGroups = () => (
      <FormGroup fieldId='groups' key='editGroups' label={t`Groups`}>
        {formErrors.groups ? (
          <Alert title={formErrors.groups.title} variant='danger' isInline>
            {formErrors.groups.description}
          </Alert>
        ) : (
          <APISearchTypeAhead
            results={this.state.searchGroups}
            loadResults={this.loadGroups}
            onSelect={this.onSelectGroup}
            placeholderText={t`Select groups`}
            selections={user.groups}
            multiple
            onClear={this.clearGroups}
            isDisabled={isReadonly}
          />
        )}
        <FormFieldHelper
          variant={'groups' in errorMessages ? 'error' : 'default'}
        >
          {errorMessages['groups']}
        </FormFieldHelper>
      </FormGroup>
    );

    const superuserLabel = (
      <FormGroup
        fieldId='is_superuser'
        key='superuserLabel'
        label={t`User type`}
      >
        <Tooltip
          content={t`Super users have all system permissions regardless of what groups they are in.`}
        >
          <Switch
            isDisabled={
              !(this.context as IAppContextType).user.is_superuser ||
              isReadonly ||
              (this.context as IAppContextType).user.id === user.id
            }
            label={t`Super user`}
            labelOff={t`Not a super user`}
            isChecked={user.is_superuser}
            onChange={() =>
              this.updateUserFieldByName(!user.is_superuser, 'is_superuser')
            }
          />
        </Tooltip>
        <FormFieldHelper
          variant={'is_superuser' in errorMessages ? 'error' : 'default'}
        >
          {errorMessages['is_superuser'] || this.getSuperUserHelperText(user)}
        </FormFieldHelper>
      </FormGroup>
    );

    const formButtons = () => (
      <ActionGroup key='actions'>
        <Button
          type='submit'
          isDisabled={
            !this.isPassValid(user.password, passwordConfirm) ||
            !this.requiredFilled(user)
          }
        >
          {t`Save`}
        </Button>
        <Button key='cancel' onClick={() => onCancel()} variant='link'>
          {t`Cancel`}
        </Button>
      </ActionGroup>
    );

    const formSuffix = [
      !isReadonly && passwordConfirmGroup(),
      isMe || isReadonly ? readonlyGroups() : editGroups(),
      isMe && isReadonly && readonlyAuth(),
      superuserLabel,
      !isReadonly && formButtons(),
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
        onSave={() => saveUser()}
      />
    );
  }

  private getSuperUserHelperText(user) {
    if (!(this.context as IAppContextType).user.is_superuser) {
      return t`Requires super user permissions to edit.`;
    }
    if ((this.context as IAppContextType).user.id === user.id) {
      return t`Super users can't disable themselves.`;
    }

    return null;
  }

  private clearGroups = () => {
    const newUser = { ...this.props.user };
    newUser.groups = [];
    this.props.updateUser(newUser, this.props.errorMessages);
  };

  private onSelectGroup = (event, selection) => {
    const { user } = this.props;

    const newUser = { ...user };

    const i = user.groups.findIndex((g) => g.name === selection);
    if (i === -1) {
      const addedGroup = this.state.searchGroups.find(
        (g) => g.name === selection,
      );
      user.groups.push(addedGroup);
    } else {
      user.groups.splice(i, 1);
    }

    this.props.updateUser(newUser, this.props.errorMessages);
  };

  private loadGroups = (name) => {
    GroupAPI.list({ name__contains: name, page_size: 5 })
      .then((result) => this.setState({ searchGroups: result.data.data }))
      .catch((e) => {
        const { status, statusText } = e.response;
        this.setState({
          formErrors: {
            ...this.state.formErrors,
            groups: {
              variant: 'danger',
              title: t`Groups list could not be displayed.`,
              description: errorMessage(status, statusText),
            },
          },
        });
      });
  };

  // confirm is empty, or matches password
  private samePass(pass, confirm) {
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

  private updateUserFieldByName(value, field) {
    const errorMessages = { ...this.props.errorMessages };

    const update = { ...this.props.user };
    update[field] = value;
    if (field in errorMessages) {
      delete errorMessages[field];
    }
    this.props.updateUser(update, errorMessages);
  }

  private updateField = (value, event) => {
    this.updateUserFieldByName(value, event.target.id);
  };
}
