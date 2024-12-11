import { t } from '@lingui/core/macro';
import React, { useState } from 'react';
import { ClipboardCopyButton } from 'src/components';

export const HubCopyButton = ({
  text,
  textId,
}: {
  text?: string;
  textId?: string;
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <ClipboardCopyButton
      onClick={() => {
        setCopied(true);
        navigator.clipboard.writeText(text);
      }}
      variant='plain'
      id='hub-copy-button'
      exitDelay={copied ? 1500 : 600}
      maxWidth='110px'
      onTooltipHidden={() => setCopied(false)}
      textId={textId}
    >
      {copied ? t`Successfully copied to clipboard` : t`Copy to clipboard`}
    </ClipboardCopyButton>
  );
};
