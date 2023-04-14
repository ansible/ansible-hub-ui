import { plural, t } from '@lingui/macro';
import { Button, Checkbox, Modal } from '@patternfly/react-core';
import React, { useState } from 'react';
import {
  AnsibleRepositoryAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
} from 'src/api';
import { AlertList, AlertType, DetailList, closeAlert } from 'src/components';
import { canEditAnsibleRepository } from 'src/permissions';
import {
  RepositoriesUtils,
  handleHttpError,
  parsePulpIDFromURL,
  taskAlert,
} from 'src/utilities';
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

const AddCollectionVersionModal = ({
  addAction,
  closeAction,
}: {
  addAction: (selected) => void;
  closeAction: () => void;
}) => {
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState<CollectionVersionSearch[]>([]);

  const addAlert = (alert: AlertType) => {
    setAlerts([...alerts, alert]);
  };

  const query = ({ params }) => {
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

    return (
      <tr
        onClick={() =>
          setSelected(
            RepositoriesUtils.pushToOrFilterOutCollections(item, selected),
          )
        }
        key={index}
      >
        <td>
          <Checkbox
            aria-label={`${namespace}.${name} v${version}`}
            id={`collection-${index}`}
            isChecked={selected.includes(item)}
            name={`collection-${index}`}
          />
        </td>
        <td>
          {namespace}.{name} v{version}
        </td>
        <td>{description}</td>
        <td>{repository.name}</td>
      </tr>
    );
  };

  return (
    <Modal
      actions={[
        <Button
          key='confirm'
          onClick={() => addAction(selected)}
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
  title: t`Add collection`,
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
