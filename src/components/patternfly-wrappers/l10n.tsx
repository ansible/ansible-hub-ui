import { t } from '@lingui/macro';
import {
  ChipGroupProps,
  ClipboardCopyButtonProps,
  ClipboardCopyProps,
  FileUploadProps,
  LabelGroupProps,
  ChipGroup as PFChipGroup,
  ClipboardCopy as PFCopy,
  ClipboardCopyButton as PFCopyButton,
  FileUpload as PFFileUpload,
} from '@patternfly/react-core';
import React from 'react';
import { LabelGroup as PFLabelGroup } from './label-group';

const count = '${remaining}'; // pf templating

export const ChipGroup = (props: ChipGroupProps) => (
  <PFChipGroup
    collapsedText={t`${count} more`}
    expandedText={t`Show Less`}
    {...props}
  />
);

export const ClipboardCopy = (props: ClipboardCopyProps) => (
  <PFCopy
    hoverTip={t`Copy to clipboard`}
    clickTip={t`Successfully copied to clipboard!`}
    textAriaLabel={t`Copyable input`}
    toggleAriaLabel={t`Show content`}
    {...props}
  />
);

export const ClipboardCopyButton = (props: ClipboardCopyButtonProps) => (
  <PFCopyButton aria-label={t`Copyable input`} {...props} />
);

export const FileUpload = (props: FileUploadProps) => (
  <PFFileUpload
    aria-label={t`File upload`}
    browseButtonText={t`Browse...`}
    clearButtonText={t`Clear`}
    filenamePlaceholder={t`Drag a file here or browse to upload`}
    {...props}
  />
);

export const LabelGroup = (props: LabelGroupProps) => (
  <PFLabelGroup
    collapsedText={t`${count} more`}
    expandedText={t`Show Less`}
    {...props}
  />
);
