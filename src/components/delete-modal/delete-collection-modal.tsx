import { Trans, t } from '@lingui/macro';
import { Checkbox, Text } from '@patternfly/react-core';
import React from 'react';
import { CollectionVersionSearch } from 'src/api';
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
  } = props;

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
        <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
          {collectionVersion ? (
            <>
              {(collections as CollectionVersionSearch[]).length === 1 ? (
                <Trans>
                  Deleting{' '}
                  <b>
                    {deleteCollection.collection_version.name} v
                    {collectionVersion}
                  </b>{' '}
                  and its data will be lost and this will cause the entire
                  collection to be deleted.
                </Trans>
              ) : (
                <Trans>
                  Deleting{' '}
                  <b>
                    {deleteCollection.collection_version.name} v
                    {collectionVersion}
                  </b>{' '}
                  and its data will be lost.
                </Trans>
              )}
            </>
          ) : (
            <Trans>
              Deleting <b>{deleteCollection.collection_version.name}</b> and its
              data will be lost.
            </Trans>
          )}
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
