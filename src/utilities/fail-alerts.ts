import { t } from '@lingui/macro';
export function errorMessage(statusCode: number, statusText: string) {
  const messages = {
    500: t`Error ${statusCode} - ${statusText}: The server encountered an error and was unable to complete your request.`,
    401: t`Error ${statusCode} - ${statusText}: You do not have the required permissions to proceed with this request. Please contact the server administrator for elevated permissions.`,
    403: t`Error ${statusCode} - ${statusText}: Forbidden: You do not have the required permissions to proceed with this request. Please contact the server administrator for elevated permissions.`,
    404: t`Error ${statusCode} - ${statusText}: The server could not find the requested URL.`,
    400: t`Error ${statusCode} - ${statusText}: The server was unable to complete your request.`,
    default: t`Error ${statusCode} - ${statusText}`,
  };
  return messages[statusCode] || messages.default;
}
