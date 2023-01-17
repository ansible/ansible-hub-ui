import { Trans, t } from '@lingui/macro';
import { Checkbox, Text } from '@patternfly/react-core';
import React from 'react';
import { CollectionDetailType, CollectionListType } from 'src/api';
import { DeleteModal } from 'src/components';

interface IProps {
  deleteCollection: CollectionDetailType | CollectionListType;
  isDeletionPending: boolean;
  confirmDelete: boolean;
  collectionVersion?: string;
  cancelAction: () => void;
  deleteAction: () => void;
  setConfirmDelete: (val) => void;
}

export class DeleteCollectionModal extends React.Component<IProps> {
  render() {
    const {
      deleteCollection,
      isDeletionPending,
      confirmDelete,
      collectionVersion,
      cancelAction,
      deleteAction,
      setConfirmDelete,
    } = this.props;

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
                {(deleteCollection as CollectionDetailType).all_versions
                  .length === 1 ? (
                  <Trans>
                    Deleting{' '}
                    <b>
                      {deleteCollection.name} v{collectionVersion}
                    </b>{' '}
                    and its data will be lost and this will cause the entire
                    collection to be deleted.
                  </Trans>
                ) : (
                  <Trans>
                    Deleting{' '}
                    <b>
                      {deleteCollection.name} v{collectionVersion}
                    </b>{' '}
                    and its data will be lost.
                  </Trans>
                )}
              </>
            ) : (
              <Trans>
                Deleting <b>{deleteCollection.name}</b> and its data will be
                lost.
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
  }
}
