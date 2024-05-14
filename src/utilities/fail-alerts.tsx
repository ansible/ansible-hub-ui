import { t } from '@lingui/macro';
import React from 'react';
import { LoginLink } from 'src/components';
import { mapErrorMessages } from './map-error-messages';

export function errorMessage(
  statusCode: number,
  statusText: string,
  customMessage?: string,
) {
  const messages = {
    500: t`Error ${statusCode} - ${statusText}: The server encountered an error and was unable to complete your request.`,
    401: t`Error ${statusCode} - ${statusText}: You do not have the required permissions to proceed with this request. Please contact the server administrator for elevated permissions.`,
    403: t`Error ${statusCode} - ${statusText}: Forbidden: You do not have the required permissions to proceed with this request. Please contact the server administrator for elevated permissions.`,
    404: t`Error ${statusCode} - ${statusText}: The server could not find the requested URL.`,
    400: t`Error ${statusCode} - ${statusText}: The server was unable to complete your request.`,
    default: t`Error ${statusCode} - ${statusText}`,
    custom: t`Error ${statusCode} - ${statusText}: ${customMessage}`,
  };
  if (customMessage) {
    return messages.custom;
  }
  return messages[statusCode] || messages.default;
}

export function jsxErrorMessage(code, text, custom?) {
  const description = errorMessage(code, text, custom);

  if (code == 401) {
    return (
      <>
        {description}
        <br />
        <LoginLink />
      </>
    );
  }

  return description;
}

export const handleHttpError = (title, callback, addAlert) => (e) => {
  let description = e.toString();

  if (e.response) {
    // HTTP error
    const { status, statusText } = e.response;

    const err = mapErrorMessages(e);
    const message = Object.values(err).join(' ');

    description = jsxErrorMessage(status, statusText, message);
  }

  addAlert({
    title,
    variant: 'danger',
    description,
  });

  callback();
};
