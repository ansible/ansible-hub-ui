import { t } from '@lingui/core/macro';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { type FunctionComponent, useState } from 'react';
import { FileUpload } from 'src/components';

interface IProps {
  isOpen: boolean;
  onSubmit: (file: File) => void;
  onCancel: () => void;
}

export const UploadSignatureModal: FunctionComponent<IProps> = ({
  isOpen,
  onSubmit,
  onCancel,
}) => {
  const [filename, setFilename] = useState('');
  const [path, setPath] = useState<File | null>(null);

  const handleFileInputChange = (_event, file) => {
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
        filename={filename}
        id='certificate-file'
        onClearClick={() => setFilename('')}
        onFileInputChange={handleFileInputChange}
      />
    </Modal>
  );
};
