import { t } from '@lingui/core/macro';

export function validateURLHelper(
  outsideError: string | undefined,
  url: string,
): {
  variant: 'default' | 'warning' | 'error';
  children?: string;
} {
  if (outsideError) {
    return { variant: 'error', children: outsideError };
  }

  try {
    const { protocol } = new URL(url);
    if (protocol === 'http:') {
      return {
        variant: 'warning',
        children: t`Consider using a secure URL (https://).`,
      };
    }

    if (protocol === 'https:') {
      return { variant: 'default' };
    }
  } catch (_) {
    // fallthrough
  }

  return {
    variant: 'error',
    children: t`The URL needs to be in 'http(s)://' format.`,
  };
}
