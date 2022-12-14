// Transforms the error message format from the API into an object such that
// {<backendFieldID>: <errorMessage>}

export class ErrorMessagesType {
  [key: string]: string;
}

export function mapErrorMessages(err): ErrorMessagesType {
  const messages = {};

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
  name,
): 'default' | 'error' {
  let names = [];
  if (Array.isArray(name)) {
    names = name;
  } else {
    names.push(name);
  }

  if (!errorMessagesType) {
    return 'default';
  }

  return names.find((n) => errorMessagesType[n]) ? 'error' : 'default';
}

export function isFormValid(errorMessages: ErrorMessagesType) {
  if (!errorMessages) {
    return true;
  }

  return !Object.values(errorMessages).find(Boolean);
}

export function alertErrorsWithoutFields(
  errorMessages: ErrorMessagesType,
  fields,
  addAlert,
  title,
  setErrorMessages,
) {
  if (!errorMessages) {
    return;
  }

  // select only errors without associated field
  const errors = Object.keys(errorMessages)
    .filter((field) => !fields.includes(field))
    .map((field) => errorMessages[field]);

  if (errors.length) {
    // alert them
    addAlert({
      variant: 'danger',
      title: title,
      description: errors.join('\n'),
    });

    // filter only errors with field, rest will be removed from the state, because they were already alerted
    const formErrors = {};

    Object.keys(errorMessages).forEach((field) => {
      if (fields.includes(field)) {
        formErrors[field] = errorMessages[field];
      }
    });

    setErrorMessages(formErrors);
  }

  return;
}
