import { t } from '@lingui/macro';
import { Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { wisdomDenyIndexAPI } from 'src/api';

interface IProps {
  scope: string;
  reference: string;
  cancelAction: () => void;
}

export const WisdomNamespaceModal = (props: IProps) => {
  const [isInDenyList, setIsInDenyList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wisdomDenyIndexAPI.isInList(props.scope, props.reference).then((result) => {
      setIsInDenyList(result);
      setLoading(false);
    });
  }, []);

  return (
    <Modal
      actions={[]}
      isOpen={true}
      onClose={props.cancelAction}
      title={t`Wisdom namespace modal`}
      titleIconVariant='warning'
      variant='small'
    >
      Namespace {props.reference}
      {loading ? (
        <Spinner />
      ) : (
        <div>
          {isInDenyList
            ? t`The namespace will not be used by Ansible Wisdom`
            : t`The namespace will be used by Ansible Wisdom`}
        </div>
      )}
    </Modal>
  );
};
