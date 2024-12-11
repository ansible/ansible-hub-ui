import { t } from '@lingui/core/macro';
import React from 'react';
import { ClipboardCopy } from 'src/components';

export const CopyURL = ({
  url,
  fallback = null,
}: {
  url: string;
  fallback?: true | string;
}) => {
  if (fallback === true) {
    fallback = t`None`;
  }

  return url ? (
    <ClipboardCopy variant='inline-compact' isCode>
      {url}
    </ClipboardCopy>
  ) : (
    <>{fallback}</>
  );
};
