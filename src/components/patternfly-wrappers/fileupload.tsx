import { t } from '@lingui/macro';
import {
  FileUploadProps,
  FileUpload as PFFileUpload,
} from '@patternfly/react-core';
import * as React from 'react';

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
