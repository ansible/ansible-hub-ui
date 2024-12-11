import { t } from '@lingui/core/macro';
import {
  ActionGroup,
  Button,
  FormGroup,
  Label,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { GroupAPI, type UserType } from 'src/api';
import {
  Alert,
  type AlertType,
  DataForm,
  FormFieldHelper,
  HelpButton,
  Typeahead,
} from 'src/components';
import { useHubContext } from 'src/loaders/app-context';
import { type ErrorMessagesType, jsxErrorMessage } from 'src/utilities';

interface IProps {
  errorMessages: ErrorMessagesType;
  isMe?: boolean;
  isNewUser?: boolean;
  isReadonly?: boolean;
  onCancel?: () => void;
  saveUser?: () => void;
  updateUser: (user: UserType, errorMesssages: object) => void;
  user: UserType;
}

export const UserForm = ({
  errorMessages,
  isMe,
  isNewUser,
  isReadonly,
  onCancel,
  saveUser,
  updateUser,
  user,
}: IProps) => {
  const { settings, user: currentUser } = useHubContext();

  const [formErrors, setFormErrors] = useState<{ groups: AlertType }>({
    groups: null,
  });
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [searchGroups, setSearchGroups] = useState<
    { name: string; id: number }[]
  >([]);

  useEffect(() => loadGroups(''), []);

  const minLength = settings.GALAXY_MINIMUM_PASSWORD_LENGTH || 9; // actually counts codepoints, close enough

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
        <HelpButton
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
          samePass(user.password, passwordConfirm) ? 'default' : 'error'
        }
        isDisabled={isReadonly}
        id='password-confirm'
        value={passwordConfirm}
        onChange={(_event, value) => {
          setPasswordConfirm(value);
        }}
        type='password'
        autoComplete='off'
      />
      <FormFieldHelper
        variant={samePass(user.password, passwordConfirm) ? 'default' : 'error'}
      >
        {samePass(user.password, passwordConfirm)
          ? null
          : t`Passwords do not match`}
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

  const readonlyGroups = () =>
    user.groups.length ? (
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
    ) : null;

  const editGroups = () => (
    <FormGroup fieldId='groups' key='editGroups' label={t`Groups`}>
      {formErrors.groups ? (
        <Alert title={formErrors.groups.title} variant='danger' isInline>
          {formErrors.groups.description}
        </Alert>
      ) : (
        <Typeahead
          results={searchGroups}
          loadResults={loadGroups}
          onSelect={onSelectGroup}
          placeholderText={t`Select groups`}
          selections={user.groups}
          multiple
          onClear={clearGroups}
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
      label={
        <>
          {t`User type`}
          <HelpButton
            content={t`Super users have all system permissions regardless of what groups they are in.`}
          />
        </>
      }
    >
      {isReadonly ? (
        user.is_superuser ? (
          t`Super user`
        ) : (
          t`Not a super user`
        )
      ) : (
        <>
          <Switch
            isDisabled={
              !currentUser.is_superuser ||
              isReadonly ||
              currentUser.id === user.id
            }
            label={t`Super user`}
            labelOff={t`Not a super user`}
            isChecked={user.is_superuser}
            onChange={() =>
              updateUserFieldByName(!user.is_superuser, 'is_superuser')
            }
          />
          <FormFieldHelper
            variant={'is_superuser' in errorMessages ? 'error' : 'default'}
          >
            {errorMessages['is_superuser'] || getSuperUserHelperText(user)}
          </FormFieldHelper>
        </>
      )}
    </FormGroup>
  );

  const formButtons = () => (
    <ActionGroup key='actions'>
      <Button
        type='submit'
        isDisabled={
          !isPassValid(user.password, passwordConfirm) || !requiredFilled(user)
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
      updateField={(e, v) => updateField(v, e)}
      onSave={() => saveUser()}
    />
  );

  function getSuperUserHelperText(user) {
    if (!currentUser.is_superuser) {
      return t`Requires super user permissions to edit.`;
    }
    if (currentUser.id === user.id) {
      return t`Super users can't disable themselves.`;
    }

    return null;
  }

  function clearGroups() {
    const newUser = { ...user };
    newUser.groups = [];
    updateUser(newUser, errorMessages);
  }

  function onSelectGroup(event, selection) {
    const newUser = { ...user };

    const i = user.groups.findIndex((g) => g.name === selection);
    if (i === -1) {
      const addedGroup = searchGroups.find((g) => g.name === selection);
      user.groups.push(addedGroup);
    } else {
      user.groups.splice(i, 1);
    }

    updateUser(newUser, errorMessages);
  }

  function loadGroups(name) {
    GroupAPI.list({ name__contains: name, page_size: 5 })
      .then((result) => setSearchGroups(result.data.data))
      .catch((e) => {
        const { status, statusText } = e.response;
        setFormErrors({
          ...formErrors,
          groups: {
            variant: 'danger',
            title: t`Groups list could not be displayed.`,
            description: jsxErrorMessage(status, statusText),
          },
        });
      });
  }

  // confirm is empty, or matches password
  function samePass(pass, confirm) {
    return !confirm || pass === confirm;
  }

  // both passwords missing, or both match
  function isPassValid(pass, confirm) {
    return !(pass || confirm) || pass === confirm;
  }

  function requiredFilled(user) {
    if (isNewUser) {
      return !!user.password && !!user.username;
    } else {
      return !!user.username;
    }
  }

  function updateUserFieldByName(value, field) {
    const newMessages = { ...errorMessages };

    const update = { ...user };
    update[field] = value;
    if (field in newMessages) {
      delete newMessages[field];
    }
    updateUser(update, newMessages);
  }

  function updateField(value, event) {
    updateUserFieldByName(value, event.target.id);
  }
};
