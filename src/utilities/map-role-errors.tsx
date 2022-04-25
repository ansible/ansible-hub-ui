import { t } from '@lingui/macro';

export function mapNetworkErrors(err) {
  const errors = { ...err.response.data };
  for (const field in errors) {
    errors[field] = errors[field].toString().split(',').join(' ');
  }
  return errors;
}

export function validateInput(input, field, currentErrors) {
  const errors = { ...currentErrors };
  if (input === '') {
    errors[field] = t`This field may not be blank.`;
  } else if (field === 'name' && !/^[ a-zA-Z0-9_.]+$/.test(input)) {
    errors[field] = t`This field can only contain letters and numbers`;
  } else if (input.length <= 2) {
    errors[field] = t`This field must be longer than 2 characters`;
  } else if (field === 'name' && !input.startsWith('galaxy.')) {
    errors[field] = t`This field must start with 'galaxy.'.`;
  } else {
    delete errors[field];
  }

  return errors;
}
