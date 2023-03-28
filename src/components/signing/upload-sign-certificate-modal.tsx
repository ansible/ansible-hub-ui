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
  onSubmit: (file: File) => void;
  onCancel: () => void;
}

export const UploadSingCertificateModal: React.FC<Props> = ({
  isOpen,
  onSubmit,
  onCancel,
}) => {
  const [filename, setFilename] = useState('');
  const [path, setPath] = useState<File | null>(null);

  const handleFileInputChange = (e, file) => {
    setFilename(file.name);
    setPath(file);
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
          isDisabled={!filename}
          onClick={() => {
            onSubmit(path);
            setFilename('');
            setPath(null);
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
        filenamePlaceholder={t`Drag and drop a file or upload one.`}
        browseButtonText={t`Select file`}
        onFileInputChange={handleFileInputChange}
        onClearClick={() => setFilename('')}
      />
    </Modal>
  );
};
