import { t } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  FileUpload,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onSubmit: (path: string) => void;
  onCancel: () => void;
}

export const UploadSingCertificateModal: React.FC<Props> = ({
  isOpen,
  onSubmit,
  onCancel,
}) => {
  const [filename, setFilename] = useState('');
  const [path, setPath] = useState('');

  const handleFileInputChange = (_e, file) => {
    setFilename(file.name);
    setPath(file.path);
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t`Upload signature`}
      isOpen={isOpen}
      onClose={onCancel}
      actions={[
        <Button
          key='upload'
          variant={ButtonVariant.primary}
          onClick={() => {
            onSubmit(path);
            setFilename('');
            setPath('');
          }}
        >
          {t`Upload`}
        </Button>,
        <Button key='cancel' variant={ButtonVariant.link} onClick={onCancel}>
          {t`Cancel`}
        </Button>,
      ]}
    >
      <p>{t`Please select a signature file to upload.`}</p>
      <FileUpload
        id='certificate-file'
        filename={filename}
        filenamePlaceholder='Drag and drop a file or upload one'
        browseButtonText={t`Select file`}
        onFileInputChange={handleFileInputChange}
        onClearClick={() => setFilename('')}
      />
    </Modal>
  );
};
