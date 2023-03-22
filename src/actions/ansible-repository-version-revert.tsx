import { Trans, t } from '@lingui/macro';
import { Button, Modal, Spinner } from '@patternfly/react-core';
import React, { useState } from 'react';
import { AnsibleRepositoryAPI } from 'src/api';
import { handleHttpError, parsePulpIDFromURL, taskAlert } from 'src/utilities';
import { Action } from './action';

const RevertModal = ({
  version,
  cancelAction,
  revertAction,
}: {
  version: number;
  cancelAction: () => void;
  revertAction: () => void;
}) => {
  const [pending, setPending] = useState(false);

  return (
    <Modal
      actions={[
        <div data-cy='delete-button' key='delete'>
          <Button
            key='delete'
            onClick={() => {
              setPending(true);
              revertAction();
            }}
            variant='danger'
            isDisabled={pending}
          >
            {t`Revert`}
            {pending && <Spinner size='sm'></Spinner>}
          </Button>
        </div>,
        <Button key='cancel' onClick={cancelAction} variant='link'>
          {t`Cancel`}
        </Button>,
      ]}
      isOpen={true}
      onClose={cancelAction}
      title={t`Revert repository`}
      titleIconVariant='warning'
      variant={'small'}
      data-cy='modal_checkbox'
    >
      <Trans>
        Are you sure you want to revert this repository to the version below?
      </Trans>
      <br />
      <b>{version}</b>
    </Modal>
  );
};

function revert(
  { repositoryName, pulp_href, number },
  { addAlert, setState, query },
) {
  const pulpId = parsePulpIDFromURL(pulp_href);
  const versionHref = 'TODO';

  // TODO AnsibleRepositoryAPI.revert(pulpId, versionHref)
  return (
    Math.random() < 0.5
      ? Promise.reject({
          response: { status: 500, statusText: 'not implemented' },
        })
      : Promise.resolve({
          data: { task: '00000000-0000-0000-0000-000000000000' },
        })
  )
    .then(({ data }) => {
      addAlert(
        taskAlert(
          data.task,
          t`Revert started for repository "${repositoryName}".`,
        ),
      );
      setState({ revertModal: null });
      query();
    })
    .catch(
      handleHttpError(
        t`Failed to revert repository "${repositoryName}" to version "${number}"`,
        () => setState({ revertModal: null }),
        addAlert,
      ),
    );
}

export const ansibleRepositoryVersionRevertAction = Action({
  title: t`Revert to this version`,
  modal: ({ addAlert, state, setState, query }) =>
    state.revertModal ? (
      <RevertModal
        cancelAction={() => setState({ revertModal: null })}
        revertAction={() =>
          revert(state.revertModal, { addAlert, setState, query })
        }
        version={state.revertModal.number}
      />
    ) : null,
  onClick: ({ repositoryName, number, pulp_href }, { setState }) =>
    setState({ revertModal: { repositoryName, number, pulp_href } }),
  disabled: ({ isLatest }) => {
    if (isLatest) {
      return t`Already the current version`;
    }

    return null;
  },
});
