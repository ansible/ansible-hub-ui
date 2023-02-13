import { t } from '@lingui/macro';
import { Alert, Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useContext } from 'src/loaders/app-context';
import { errorMessage } from 'src/utilities';

interface IProps {
  children?: React.ReactNode;
  title?: string;
}

// TODO API
const FakeUserAPI = {
  eulaAccept: (user) => {
    console.log('TODO accept eula api', user);
    return new Promise((resolve) => setTimeout(resolve, 2000));
  },
  eulaDecline: (user) => {
    console.log('TODO decline eula api', user);
    return Promise.reject({ response: { status: 500, statusText: 'TODO' } });
  },
};

// for authenticated users
// show modal unless user.TODO_eula_confirmed
// there are two buttons - Accept and Decline
// both submit to API
export const EulaModalUser = ({ title, children }: IProps) => {
  const { user } = useContext();
  const [error, setError] = useState(null);
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

  title ||= t`Project Wisdom Participation Agreement`;
  children ||= <>Lorem ipsum... 🚧</>;

  const handle = (apiCall) => () => {
    setSpinner(true);
    apiCall()
      .then(() => {
        setSpinner(false);
        setOpen(false);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        setSpinner(false);
        setError(errorMessage(status, statusText));
      });
  };
  const accept = handle(() => FakeUserAPI.eulaAccept(user));
  const decline = handle(() => FakeUserAPI.eulaDecline(user));

  return (
    <Modal
      actions={[
        <Button key='confirm' onClick={accept} variant='primary'>
          {t`Agree`}
        </Button>,
        <Button key='cancel' onClick={decline} variant='secondary'>
          {t`Disagree`}
        </Button>,
        spinner ? <Spinner size='sm'></Spinner> : null,
      ]}
      isOpen={true}
      showClose={!!error}
      title={title}
      variant='medium'
    >
      {children}
      {error ? (
        <Alert title={t`Failed to submit response`} variant='danger' isInline>
          {error}
        </Alert>
      ) : null}
    </Modal>
  );
};
