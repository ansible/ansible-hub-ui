import { t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useContext } from 'src/loaders/app-context';

interface IProps {
  children?: React.ReactNode;
  title?: string;
}

// TODO API
const FakeUserAPI = {
  eulaAccept: (user) => {
    console.log('TODO accept eula api', user);
    return Promise.resolve();
  },
  eulaDecline: (user) => {
    console.log('TODO decline eula api', user);
    return Promise.resolve();
  },
};

// for authenticated users
// show modal unless user.TODO_eula_confirmed
// there are two buttons - Accept and Decline
// both submit to API
export const EulaModalUser = ({ title, children }: IProps) => {
  const { user } = useContext();
  const [isOpen, setOpen] = useState(false);
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    if (user) {
      setOpen(!user['TODO_eula_confirmed']);
    }
  }, [user]);

  if (!user || user.is_anonymous || !isOpen) {
    return null;
  }

  title ||= t`Ansible Galaxy EULA`;
  children ||= <>🚧 Lorem ipsum...</>;

  const handle = (api) => () => {
    setSpinner(true);
    api
      .then(() => {
        setSpinner(false);
        setOpen(false);
      })
      .catch((e) => {
        console.log('TODO handle', e);
        setSpinner(false);
      });
  };
  const accept = handle(() => FakeUserAPI.eulaAccept(user));
  const decline = handle(() => FakeUserAPI.eulaDecline(user));

  return (
    <Modal
      actions={[
        <Button key='confirm' onClick={accept} variant='primary'>
          {t`Accept`}
        </Button>,
        <Button key='cancel' onClick={decline} variant='secondary'>
          {t`Decline`}
        </Button>,
        spinner ? <Spinner size='sm'></Spinner> : null,
      ]}
      isOpen={true}
      showClose={false}
      title={title}
      titleIconVariant='info'
      variant='small'
    >
      {children}
    </Modal>
  );
};
