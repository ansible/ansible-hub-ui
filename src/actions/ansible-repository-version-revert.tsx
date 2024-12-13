import { msg, t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Button, Modal } from '@patternfly/react-core';
import { useState } from 'react';
import { AnsibleRepositoryAPI } from 'src/api';
import { Spinner } from 'src/components';
import { canRevertAnsibleRepositoryVersion } from 'src/permissions';
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
            {pending && <Spinner size='sm' />}
          </Button>
        </div>,
        <Button key='cancel' onClick={cancelAction} variant='link'>
          {t`Cancel`}
        </Button>,
      ]}
      isOpen
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
  // the uuid in version href is the reposotory uuid
  const pulpId = parsePulpIDFromURL(pulp_href);

  return AnsibleRepositoryAPI.revert(pulpId, pulp_href)
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
  condition: canRevertAnsibleRepositoryVersion,
  title: msg`Revert to this version`,
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
