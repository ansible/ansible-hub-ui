import { t } from '@lingui/macro';
import {
  FileUploadProps,
  FileUpload as PFFileUpload,
} from '@patternfly/react-core';
import React from 'react';

// wraps FileUpload for localization
export const FileUpload = (props: FileUploadProps) => (
  <PFFileUpload
    browseButtonText={t`Upload`}
    clearButtonText={t`Clear`}
    filenamePlaceholder={t`Drag and drop a file or upload one`}
    {...props}
  />
);
