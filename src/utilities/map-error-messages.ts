// Transforms the error message format from the API into an object such that
// {<backendFieldID>: <errorMessage>}

export class ErrorMessagesType {
  [key: string]: string;
}

export function mapErrorMessages(err): ErrorMessagesType {
  const messages = {};

  debugger;
  // 500 errors only have err.response.data string
  if (typeof err.response.data === 'string') {
    messages['__nofield'] = err.response.data;
    return messages;
  }

  for (const e of err.response.data.errors) {
    if (e.source) {
      messages[e.source.parameter] = e.detail;
    } else {
      // some error responses are too cool to have a
      // parameter set on them >:(
      messages['__nofield'] = e.detail || e.title;
    }
  }

  return messages;
}

export function isFieldValid(
  errorMessagesType: ErrorMessagesType,
  name: string,
) {
  if (!errorMessagesType) return 'default';
  if (errorMessagesType[name]) return 'error';

  return 'default';
}

export function isFormValid(errorMessagesType: ErrorMessagesType) {
  debugger;
  if (!errorMessagesType) return true;
  if (Object.keys(errorMessagesType).length == 0) return true;

  let valid = true;
  // if any key contains error text inside, its invalid
  Object.keys(errorMessagesType).forEach((error) => {
    if (error) {
      valid = false;
    }
  });
  return valid;
}
