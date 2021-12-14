import * as React from 'react';
import { t } from '@lingui/macro';

import {
  FileUpload as PFFileUpload,
  FileUploadProps,
} from '@patternfly/react-core';

export class FileUpload extends React.Component<FileUploadProps> {
  render() {
    return (
      <PFFileUpload
        browseButtonText={t`Browse...`}
        clearButtonText={t`Clear`}
        filenamePlaceholder={t`Drag a file here or browse to upload`}
        {...this.props}
      />
    );
  }
}
