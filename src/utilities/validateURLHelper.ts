import { t } from '@lingui/macro';

export function validateURLHelper(
  outsideError: string | undefined,
  url: string,
): {
  validated: 'default' | 'warning' | 'error';
  helperTextInvalid?: string;
  helperText?: string;
} {
  if (outsideError) {
    return { validated: 'error', helperTextInvalid: outsideError };
  }

  try {
    const { protocol } = new URL(url);
    if (protocol === 'http:') {
      return {
        validated: 'warning',
        helperText: t`Consider using a secure URL (https://).`,
      };
    }

    if (protocol === 'https:') {
      return { validated: 'default' };
    }
  } catch (_) {
    // fallthrough
  }

  return {
    validated: 'error',
    helperTextInvalid: t`The URL needs to be in 'http(s)://' format.`,
  };
}
