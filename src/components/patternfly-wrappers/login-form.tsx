import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  LoginFormProps,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import React, { FunctionComponent, useState } from 'react';

// replaces LoginForm to add autoComplete=off to inputs
// this comes from @patternfly/react-core@5.2.0
// packages/react-core/src/components/LoginPage/LoginForm.tsx
// localization done separately in l10n.tsx
export const LoginForm: FunctionComponent<LoginFormProps> = ({
  noAutoFocus = false,
  className = '',
  showHelperText = false,
  helperText = null,
  helperTextIcon = null,
  usernameLabel = 'Username',
  usernameValue = '',
  onChangeUsername = () => undefined,
  isValidUsername = true,
  passwordLabel = 'Password',
  passwordValue = '',
  onChangePassword = () => undefined,
  isShowPasswordEnabled = false,
  hidePasswordAriaLabel = 'Hide password',
  showPasswordAriaLabel = 'Show password',
  isValidPassword = true,
  loginButtonLabel = 'Log In',
  isLoginButtonDisabled = false,
  onLoginButtonClick = () => undefined,
  rememberMeLabel = '',
  isRememberMeChecked = false,
  onChangeRememberMe = () => undefined,
  ...props
}: LoginFormProps) => {
  const [passwordHidden, setPasswordHidden] = useState(true);

  const passwordInput = (
    <TextInput
      isRequired
      type={passwordHidden ? 'password' : 'text'}
      id='pf-login-password-id'
      name='pf-login-password-id'
      validated={
        isValidPassword ? ValidatedOptions.default : ValidatedOptions.error
      }
      value={passwordValue}
      onChange={onChangePassword}
      autoComplete='off'
    />
  );

  return (
    <Form className={className} {...props}>
      {showHelperText && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={
                !isValidUsername || !isValidPassword ? 'error' : 'default'
              }
              icon={helperTextIcon}
            >
              {helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      <FormGroup
        label={usernameLabel}
        isRequired
        fieldId='pf-login-username-id'
      >
        <TextInput
          autoFocus={!noAutoFocus}
          id='pf-login-username-id'
          isRequired
          validated={
            isValidUsername ? ValidatedOptions.default : ValidatedOptions.error
          }
          type='text'
          name='pf-login-username-id'
          value={usernameValue}
          onChange={onChangeUsername}
          autoComplete='off'
        />
      </FormGroup>
      <FormGroup
        label={passwordLabel}
        isRequired
        fieldId='pf-login-password-id'
      >
        {isShowPasswordEnabled && (
          <InputGroup>
            <InputGroupItem isFill>{passwordInput}</InputGroupItem>
            <InputGroupItem>
              <Button
                variant='control'
                onClick={() => setPasswordHidden(!passwordHidden)}
                aria-label={
                  passwordHidden ? showPasswordAriaLabel : hidePasswordAriaLabel
                }
              >
                {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
              </Button>
            </InputGroupItem>
          </InputGroup>
        )}
        {!isShowPasswordEnabled && passwordInput}
      </FormGroup>
      {rememberMeLabel.length > 0 && (
        <FormGroup fieldId='pf-login-remember-me-id'>
          <Checkbox
            id='pf-login-remember-me-id'
            label={rememberMeLabel}
            isChecked={isRememberMeChecked}
            onChange={onChangeRememberMe}
          />
        </FormGroup>
      )}
      <ActionGroup>
        <Button
          variant='primary'
          type='submit'
          onClick={onLoginButtonClick}
          isBlock
          isDisabled={isLoginButtonDisabled}
        >
          {loginButtonLabel}
        </Button>
      </ActionGroup>
    </Form>
  );
};
LoginForm.displayName = 'LoginForm';
