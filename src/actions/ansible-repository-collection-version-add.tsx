import { msg, plural, t } from '@lingui/macro';
import { Button, Checkbox, Modal } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import React, { useState } from 'react';
import {
  AnsibleRepositoryAPI,
  type AnsibleRepositoryType,
  CollectionVersionAPI,
  type CollectionVersionSearch,
} from 'src/api';
import {
  AlertList,
  type AlertType,
  DetailList,
  closeAlert,
} from 'src/components';
import { canEditAnsibleRepository } from 'src/permissions';
import { handleHttpError, parsePulpIDFromURL, taskAlert } from 'src/utilities';
import { Action } from './action';

const add = (
  { repositoryHref, repositoryName },
  collections,
  { addAlert, setState, query },
) => {
  const pulpId = parsePulpIDFromURL(repositoryHref);
  const collectionVersionHrefs = collections.map(
    (c) => c.collection_version.pulp_href,
  );
  return AnsibleRepositoryAPI.addContent(pulpId, collectionVersionHrefs)
    .then(({ data }) => {
      collections.map(
        ({ collection_version: { name, namespace, version }, repository }) => {
          addAlert(
            taskAlert(
              data.task,
              t`Started adding ${namespace}.${name} v${version} from "${repository.name}" to repository "${repositoryName}".`,
            ),
          );
          setState((ms) => ({ ...ms, addCollectionVersionModal: null }));
          query({});
        },
      );
    })
    .catch(
      handleHttpError(
        plural(collections.length, {
          one: `Failed to add collection to repository "${repositoryName}".`,
          other: `Failed to add collections to repository "${repositoryName}".`,
        }),
        () => setState((ms) => ({ ...ms, addCollectionVersionModal: null })),
        addAlert,
      ),
    );
};

function pushToOrFilterOutCollections(
  selectedCollection: CollectionVersionSearch,
  collections: CollectionVersionSearch[],
): CollectionVersionSearch[] {
  // check if collection is already selected
  const selectedItem = collections.find(
    ({ collection_version: cv, repository }) =>
      cv.pulp_href === selectedCollection.collection_version.pulp_href &&
      repository.pulp_href === selectedCollection.repository.pulp_href,
  );

  // if collection is not selected, add it to selected items
  if (!selectedItem) {
    return [...collections, selectedCollection];
  }

  // unselect collection
  return collections.filter(
    ({ collection_version: cv, repository }) =>
      cv.pulp_href !== selectedCollection.collection_version.pulp_href ||
      repository.pulp_href !== selectedCollection.repository.pulp_href,
  );
}

const AddCollectionVersionModal = ({
  addAction,
  closeAction,
  sourceRepository,
}: {
  addAction: (selected) => void;
  closeAction: () => void;
  sourceRepository: AnsibleRepositoryType;
}) => {
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState<CollectionVersionSearch[]>([]);

  const addAlert = (alert: AlertType) => {
    setAlerts([...alerts, alert]);
  };

  // @ts-expect-error: TS2525: Initializer provides no value for this binding element and the binding element has no default value.
  const query = ({ params } = {}) => {
    const newParams = { ...params };
    newParams.ordering = newParams.sort;
    delete newParams.sort;

    return CollectionVersionAPI.list({
      ...newParams,
    }).then(
      ({
        data: {
          meta: { count },
          data: results,
        },
      }) => ({
        data: { count, results },
      }),
    );
  };

  const [modalState, setModalState] = useState({});

  const renderTableRow = (item: CollectionVersionSearch, index: number) => {
    const {
      collection_version: { name, namespace, version, description },
      repository,
    } = item;

    const isCollectionInRepo =
      sourceRepository.pulp_href === repository.pulp_href;

    return (
      <Tr
        onClick={() =>
          setSelected(pushToOrFilterOutCollections(item, selected))
        }
        key={index}
      >
        <Td>
          <Checkbox
            aria-label={`${namespace}.${name} v${version}`}
            id={`collection-${index}`}
            isChecked={isCollectionInRepo || selected.includes(item)}
            name={`collection-${index}`}
            isDisabled={isCollectionInRepo}
          />
        </Td>
        <Td>
          {namespace}.{name} v{version}
        </Td>
        <Td>{description}</Td>
        <Td>{repository.name}</Td>
      </Tr>
    );
  };

  return (
    <Modal
      actions={[
        <Button
          key='confirm'
          onClick={() => addAction(selected)}
          variant='primary'
          isDisabled={!selected.length}
        >
          {t`Select`}
        </Button>,
        <Button key='cancel' onClick={closeAction} variant='link'>
          {t`Cancel`}
        </Button>,
      ]}
      isOpen
      onClose={closeAction}
      title={t`Select a collection`}
      variant='large'
    >
      <section className='modal-body' data-cy='modal-body'>
        <DetailList<CollectionVersionSearch>
          actionContext={{
            addAlert,
            state: modalState,
            setState: setModalState,
            query,
            hasPermission: () => {
              throw 'unused';
            },
          }}
          defaultPageSize={10}
          defaultSort={'name'}
          errorTitle={t`Collection versions could not be displayed.`}
          filterConfig={[
            {
              id: 'keywords',
              title: t`Keywords`,
            },
            {
              id: 'namespace',
              title: t`Namespace`,
            },
            {
              id: 'repository_name',
              title: t`Repository`,
            },
          ]}
          noDataDescription={t`Collection versions will appear once a collection is uploaded.`}
          noDataTitle={t`No collection versions yet`}
          query={query}
          renderTableRow={renderTableRow}
          sortHeaders={[
            {
              title: '',
              type: 'none',
              id: 'radio',
            },
            {
              title: t`Collection`,
              type: 'none',
              id: 'col1',
            },
            {
              title: t`Description`,
              type: 'none',
              id: 'col2',
            },
            {
              title: t`Repository`,
              type: 'none',
              id: 'col3',
            },
          ]}
          title={t`Collection versions`}
        />
      </section>

      <AlertList
        alerts={alerts}
        closeAlert={(i) => closeAlert(i, { alerts, setAlerts })}
      />
    </Modal>
  );
};

export const ansibleRepositoryCollectionVersionAddAction = Action({
  condition: canEditAnsibleRepository,
  title: msg`Add collection`,
  modal: ({ addAlert, state, setState, query }) =>
    state.addCollectionVersionModal ? (
      <AddCollectionVersionModal
        addAction={(collections: CollectionVersionSearch[]) => {
          add(state.addCollectionVersionModal, collections, {
            addAlert,
            setState,
            query,
          });
        }}
        closeAction={() =>
          setState((ms) => ({ ...ms, addCollectionVersionModal: null }))
        }
        sourceRepository={state.repository}
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
    setState((ms) => ({
      ...ms,
      addCollectionVersionModal: {
        repositoryHref,
        repositoryName,
      },
    })),
});
