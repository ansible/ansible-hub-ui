import { t } from '@lingui/macro';
import {
  FileUploadProps,
  FileUpload as PFFileUpload,
} from '@patternfly/react-core';

export const FileUpload = (props: FileUploadProps) => (
  <PFFileUpload
    browseButtonText={t`Browse...`}
    clearButtonText={t`Clear`}
    filenamePlaceholder={t`Drag a file here or browse to upload`}
    {...props}
  />
);
