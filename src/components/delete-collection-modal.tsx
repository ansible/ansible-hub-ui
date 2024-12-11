import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Checkbox, Text } from '@patternfly/react-core';
import React from 'react';
import { type CollectionVersionSearch } from 'src/api';
import { DeleteModal } from 'src/components';

interface IProps {
  deleteCollection: CollectionVersionSearch;
  collections: CollectionVersionSearch[];
  isDeletionPending: boolean;
  confirmDelete: boolean;
  collectionVersion?: string;
  cancelAction: () => void;
  deleteAction: () => void;
  setConfirmDelete: (val) => void;
  deleteFromRepo: string;
}

export const DeleteCollectionModal = (props: IProps) => {
  const {
    deleteCollection,
    collections,
    isDeletionPending,
    confirmDelete,
    collectionVersion,
    cancelAction,
    deleteAction,
    setConfirmDelete,
    deleteFromRepo,
  } = props;

  const lastCollectionVersion = collectionVersion && collections.length === 1;

  return (
    deleteCollection && (
      <DeleteModal
        spinner={isDeletionPending}
        cancelAction={() => cancelAction()}
        deleteAction={() => deleteAction()}
        isDisabled={!confirmDelete || isDeletionPending}
        title={
          collectionVersion
            ? t`Delete collection version?`
            : t`Delete collection?`
        }
      >
        <Text style={{ paddingBottom: 'var(--pf-v5-global--spacer--md)' }}>
          {collectionVersion ? (
            <Trans>
              Deleting{' '}
              <b>
                {deleteCollection.collection_version.name} v{collectionVersion}
              </b>
              , its data will be lost.
            </Trans>
          ) : (
            <Trans>
              Deleting <b>{deleteCollection.collection_version.name}</b>, its
              data will be lost.
            </Trans>
          )}
          {lastCollectionVersion ? (
            <> {t`This will cause the entire collection to be deleted.`}</>
          ) : null}
          {deleteFromRepo ? (
            <>
              {' '}
              {t`The collection will be deleted only from repository ${deleteFromRepo}.`}
            </>
          ) : null}
        </Text>
        <Checkbox
          isChecked={confirmDelete}
          onChange={setConfirmDelete}
          label={t`I understand that this action cannot be undone.`}
          id='delete_confirm'
        />
      </DeleteModal>
    )
  );
};
