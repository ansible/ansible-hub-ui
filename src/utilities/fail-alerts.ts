import { t } from '@lingui/macro';
import { mapErrorMessages } from 'src/utilities';

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

export const handleHttpError = (title, callback, addAlert) => (e) => {
  const { status, statusText } = e.response;
  console.log(typeof e.response.data);

  let message = '';
  const err_detail = mapErrorMessages(e);
  for (const msg in err_detail) {
    message = message + err_detail[msg] + ' ';
  }

  let description;

  if (message !== '') {
    description = errorMessage(status, statusText, message);
  } else {
    description = errorMessage(status, statusText);
  }

  addAlert({
    title,
    variant: 'danger',
    description: description,
  });
  callback();
};
