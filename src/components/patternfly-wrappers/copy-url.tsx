import { t } from '@lingui/macro';
import { ClipboardCopy } from '@patternfly/react-core';
import React from 'react';

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
    <ClipboardCopy
      hoverTip={t`Copy`}
      clickTip={t`Copied`}
      variant='inline-compact'
      isCode
    >
      {url}
    </ClipboardCopy>
  ) : (
    <>{fallback}</>
  );
};
