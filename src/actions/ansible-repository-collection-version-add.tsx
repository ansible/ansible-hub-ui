import { t } from '@lingui/macro';
import { Button, Modal } from '@patternfly/react-core';
import React, { useState } from 'react';
import { AnsibleRepositoryAPI } from 'src/api';
import { AlertList, closeAlert } from 'src/components';
import { canEditAnsibleRepository } from 'src/permissions';
import { handleHttpError, parsePulpIDFromURL, taskAlert } from 'src/utilities';
import { Action } from './action';

const add = (
  {
    collection: { namespace, name, version, pulp_href: collectionVersionHref },
    repositoryHref,
    repositoryName,
  },
  { addAlert, setState, query },
) => {
  const pulpId = parsePulpIDFromURL(repositoryHref);
  return AnsibleRepositoryAPI.addContent(pulpId, collectionVersionHref)
    .then(({ data }) => {
      addAlert(
        taskAlert(
          data.task,
          t`Started adding ${namespace}.${name} v${version} to repository "${repositoryName}".`,
        ),
      );
      setState({ addCollectionVersionModal: null });
      query();
    })
    .catch(
      handleHttpError(
        t`Failed to add ${namespace}.${name} v${version} to repository "${repositoryName}".`,
        () => setState({ addCollectionVersionModal: null }),
        addAlert,
      ),
    );
};

const AddCollectionVersionModal = ({
  addAction,
  closeAction,
}: {
  addAction: () => void;
  closeAction: () => void;
}) => {
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState(null);

  return (
    <Modal
      actions={[
        <Button
          key='confirm'
          onClick={addAction}
          variant='primary'
          isDisabled={!selected}
        >
          {t`Select`}
        </Button>,
        <Button key='cancel' onClick={closeAction} variant='link'>
          {t`Cancel`}
        </Button>,
      ]}
      isOpen={true}
      onClose={closeAction}
      title={t`Select a collection`}
      variant='large'
    >
      <section className='modal-body' data-cy='modal-body'></section>

      <AlertList
        alerts={alerts}
        closeAlert={(i) => closeAlert(i, { alerts, setAlerts })}
      />
    </Modal>
  );
};

export const ansibleRepositoryCollectionVersionAddAction = Action({
  condition: canEditAnsibleRepository,
  title: t`Add collection`,
  modal: ({ addAlert, state, setState, query }) =>
    state.addCollectionVersionModal ? (
      <AddCollectionVersionModal
        addAction={() =>
          add(state.addCollectionVersionModal, {
            addAlert,
            setState,
            query,
          })
        }
        closeAction={() => setState({ addCollectionVersionModal: null })}
      />
    ) : null,
  onClick: (
    _item,
    {
      state: {
        repository: { name: repositoryName, pulp_href: repositoryHref },
      },
      setState,
    },
  ) =>
    setState({
      addCollectionVersionModal: {
        repositoryHref,
        repositoryName,
      },
    }),
});
