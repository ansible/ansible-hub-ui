import { Trans, t } from '@lingui/macro';
import { Text } from '@patternfly/react-core';
import React, { useState } from 'react';
import { AnsibleRepositoryAPI } from 'src/api';
import { DeleteModal } from 'src/components';
import { canEditAnsibleRepository } from 'src/permissions';
import { handleHttpError, parsePulpIDFromURL, taskAlert } from 'src/utilities';
import { Action } from './action';

const remove = (
  {
    collection: { namespace, name, version },
    collectionVersionHref,
    repositoryHref,
    repositoryName,
  },
  { addAlert, setState, query },
) => {
  const pulpId = parsePulpIDFromURL(repositoryHref);
  return AnsibleRepositoryAPI.removeContent(pulpId, collectionVersionHref)
    .then(({ data }) => {
      addAlert(
        taskAlert(
          data.task,
          t`Removal of ${namespace}.${name} v${version} from repository "${repositoryName}" started.`,
        ),
      );
      setState({ removeCollectionVersionModal: null });
      query();
    })
    .catch(
      handleHttpError(
        t`Failed to remove ${namespace}.${name} v${version} from repository "${repositoryName}".`,
        () => setState({ removeCollectionVersionModal: null }),
        addAlert,
      ),
    );
};

const RemoveCollectionVersionModal = ({
  name,
  namespace,
  repositoryName,
  version,
  closeAction,
  deleteAction,
}: {
  closeAction: () => void;
  deleteAction: () => void;
  name: string;
  namespace: string;
  repositoryName: string;
  version: string;
}) => {
  const [pending, setPending] = useState(false);

  if (!name) {
    return null;
  }

  return (
    <DeleteModal
      spinner={pending}
      cancelAction={() => {
        setPending(false);
        closeAction();
      }}
      deleteAction={() => {
        setPending(false);
        deleteAction();
      }}
      isDisabled={pending}
      isRemove
      title={t`Remove collection version?`}
    >
      <Text>
        <Trans>
          Are you sure you want to remove the collection version{' '}
          <b>
            {namespace}.{name} v{version}
          </b>{' '}
          from the <b>{repositoryName}</b> repository?
        </Trans>
      </Text>
    </DeleteModal>
  );
};

export const ansibleRepositoryCollectionVersionRemoveAction = Action({
  condition: canEditAnsibleRepository,
  title: t`Remove`,
  modal: ({ addAlert, state, setState, query }) =>
    state.removeCollectionVersionModal ? (
      <RemoveCollectionVersionModal
        closeAction={() => setState({ removeCollectionVersionModal: null })}
        deleteAction={() =>
          remove(state.removeCollectionVersionModal, {
            addAlert,
            setState,
            query,
          })
        }
        name={state.removeCollectionVersionModal.collection.name}
        namespace={state.removeCollectionVersionModal.collection.namespace}
        repositoryName={state.removeCollectionVersionModal.repositoryName}
        version={state.removeCollectionVersionModal.collection.version}
      />
    ) : null,
  onClick: (
    {
      collection_version: {
        namespace,
        name,
        version,
        pulp_href: collectionVersionHref,
      },
      repository: { name: repositoryName, pulp_href: repositoryHref },
    },
    { setState },
  ) =>
    setState({
      removeCollectionVersionModal: {
        collection: { namespace, name, version },
        repositoryName,
        repositoryHref,
        collectionVersionHref,
      },
    }),
});
