import { t } from '@lingui/macro';
import { Button, Modal } from '@patternfly/react-core';
import React, { useState } from 'react';
import { useContext } from 'src/loaders/app-context';

interface IProps {
  children?: React.ReactNode;
  title?: string;
}

// for non-authenticated users
// show modal unless localStorage.viewonly_eula_confirmed
// there's only a Confirm button
// saves in localStorage
export const EulaModalViewonly = ({ title, children }: IProps) => {
  const { user } = useContext();
  const [isOpen, setOpen] = useState(
    localStorage.viewonly_eula_confirmed !== 'true',
  );

  if (!user || !user.is_anonymous || !isOpen) {
    return null;
  }

  title ||= t`Terms of use`;
  children ||= <>Lorem ipsum... 🚧</>;

  const setConfirmed = () => {
    window.localStorage.viewonly_eula_confirmed = 'true';
    setOpen(false);
  };

  return (
    <Modal
      actions={[
        <Button key='confirm' onClick={setConfirmed} variant='primary'>
          {t`Ok`}
        </Button>,
      ]}
      isOpen={true}
      showClose={true}
      title={title}
      variant='medium'
    >
      {children}
    </Modal>
  );
};
