// this comes from @patternfly/react-core@4.276.11
// packages/react-core/src/components/LoginPage/LoginForm.tsx
// w/ fixed imports, prettier
// and added autocomplete="off" for username & password
import { t } from '@lingui/macro';
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormHelperText,
  InputGroup,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import React from 'react';

export interface LoginFormProps
  extends Omit<React.HTMLProps<HTMLFormElement>, 'ref'> {
  /** Flag to indicate if the first dropdown item should not gain initial focus */
  noAutoFocus?: boolean;
  /** Additional classes added to the login main body's form */
  className?: string;
  /** Flag indicating the helper text is visible * */
  showHelperText?: boolean;
  /** Content displayed in the helper text component * */
  helperText?: React.ReactNode;
  /** Icon displayed to the left in the helper text */
  helperTextIcon?: React.ReactNode;
  /** Label for the username input field */
  usernameLabel?: string;
  /** Value for the username */
  usernameValue?: string;
  /** Function that handles the onChange event for the username */
  onChangeUsername?: (
    value: string,
    event: React.FormEvent<HTMLInputElement>,
  ) => void;
  /** Flag indicating if the username is valid */
  isValidUsername?: boolean;
  /** Label for the password input field */
  passwordLabel?: string;
  /** Value for the password */
  passwordValue?: string;
  /** Function that handles the onChange event for the password */
  onChangePassword?: (
    value: string,
    event: React.FormEvent<HTMLInputElement>,
  ) => void;
  /** Flag indicating if the password is valid */
  isValidPassword?: boolean;
  /** Flag indicating if the user can toggle hiding the password */
  isShowPasswordEnabled?: boolean;
  /** Accessible label for the show password button */
  showPasswordAriaLabel?: string;
  /** Accessible label for the hide password button */
  hidePasswordAriaLabel?: string;
  /** Label for the log in button input */
  loginButtonLabel?: string;
  /** Flag indicating if the login button is disabled */
  isLoginButtonDisabled?: boolean;
  /** Function that is called when the login button is clicked */
  onLoginButtonClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  /** Label for the remember me checkbox that indicates the user should be kept logged in.  If the label is not provided, the checkbox will not show. */
  rememberMeLabel?: string;
  /** Flag indicating if the remember me checkbox is checked. */
  isRememberMeChecked?: boolean;
  /** Function that handles the onChange event for the remember me checkbox */
  onChangeRememberMe?: (
    checked: boolean,
    event: React.FormEvent<HTMLInputElement>,
  ) => void;
}

// replaces LoginForm for localization and to add autoComplete=off to inputs
export const LoginForm: React.FunctionComponent<LoginFormProps> = ({
  noAutoFocus = false,
  className = '',
  showHelperText = false,
  helperText = null,
  helperTextIcon = null,
  usernameLabel = t`Username`,
  usernameValue = '',
  onChangeUsername = () => undefined,
  isValidUsername = true,
  passwordLabel = t`Password`,
  passwordValue = '',
  onChangePassword = () => undefined,
  isShowPasswordEnabled = false,
  hidePasswordAriaLabel = t`Hide password`,
  showPasswordAriaLabel = t`Show password`,
  isValidPassword = true,
  loginButtonLabel = t`Log In`,
  isLoginButtonDisabled = false,
  onLoginButtonClick = () => undefined,
  rememberMeLabel = '',
  isRememberMeChecked = false,
  onChangeRememberMe = () => undefined,
  ...props
}: LoginFormProps) => {
  const [passwordHidden, setPasswordHidden] = React.useState(true);

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
      <FormHelperText
        isError={!isValidUsername || !isValidPassword}
        isHidden={!showHelperText}
        icon={helperTextIcon}
      >
        {helperText}
      </FormHelperText>
      <FormGroup
        label={usernameLabel}
        isRequired
        validated={
          isValidUsername ? ValidatedOptions.default : ValidatedOptions.error
        }
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
        validated={
          isValidPassword ? ValidatedOptions.default : ValidatedOptions.error
        }
        fieldId='pf-login-password-id'
      >
        {isShowPasswordEnabled && (
          <InputGroup>
            {passwordInput}
            <Button
              variant='control'
              onClick={() => setPasswordHidden(!passwordHidden)}
              aria-label={
                passwordHidden ? showPasswordAriaLabel : hidePasswordAriaLabel
              }
            >
              {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
            </Button>
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
