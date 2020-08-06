import * as React from 'react';

import { UploadInput } from './upload_input';

export default {
  title: 'Components / Upload Input',
};

export const basic = () => (
  <UploadInput
    uploadStatus='waiting'
    uploadProgress={0}
    handleFileUpload={files => {
      return files;
    }}
  />
);
