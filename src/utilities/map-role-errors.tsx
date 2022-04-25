import { t } from '@lingui/macro';

export function mapNetworkErrors(err) {
  const errors = { ...err.response.data };
  for (const field in errors) {
    errors[field] = errors[field].toString().split(',').join(' ');
  }
  return errors;
  // this.setState({ errorMessages: errors });
}

export function validateInput(input, field) {
  const error = { ...this.state.errorMessages };
  if (input === '') {
    error[field] = t`This field may not be blank.`;
  } else if (field === 'name' && !/^[ a-zA-Z0-9_.]+$/.test(input)) {
    error[field] = t`This field can only contain letters and numbers`;
  } else if (input.length <= 2) {
    error[field] = t`This field must be longer than 2 characters`;
  } else if (field === 'name' && !input.startsWith('galaxy.')) {
    error[field] = t`This field must start with 'galaxy.'.`;
  } else {
    delete error[field];
  }

  this.setState({
    errorMessages: error,
  });
}
