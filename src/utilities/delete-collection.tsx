import { CollectionAPI } from 'src/api';

import React from 'react';
import { errorMessage } from 'src/utilities';
import { t, Trans } from '@lingui/macro';

import { Text, DropdownItem, Checkbox, Tooltip } from '@patternfly/react-core';

import { DeleteModal } from 'src/components';

class DeleteCollectionUtils {
  public getUsedbyDependencies(collection, setDependencies, setAlerts) {
    const { name, namespace } = collection;
    CollectionAPI.getUsedDependenciesByCollection(namespace.name, name)
      .then(({ data }) => {
        setDependencies(!data.data.length);
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        setAlerts({
          variant: 'danger',
          title: t`Dependencies for collection "${name}" could not be displayed.`,
          description: errorMessage(status, statusText),
        });
      });
  }

  public deleteMenuOption(noDependencies, context, onClick) {
    return noDependencies
      ? context.user.model_permissions.delete_collection && (
          <DropdownItem
            key='delete-collection-enabled'
            onClick={() => onClick()}
            data-cy='delete-collection-dropdown'
          >
            {t`Delete entire collection`}
          </DropdownItem>
        )
      : context.user.model_permissions.delete_collection && (
          <Tooltip
            key='delete-collection-disabled'
            position='left'
            content={
              <Trans>
                Cannot delete until collections <br />
                that depend on this collection <br />
                have been deleted.
              </Trans>
            }
          >
            <DropdownItem isDisabled>
              {t`Delete entire collection`}
            </DropdownItem>
          </Tooltip>
        );
  }

  public deleteModal(
    deleteCollection,
    isDeletionPending,
    confirmDelete,
    collectionVersion,
    cancelAction,
    deleteAction,
    onChange,
  ) {
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
          <>
            <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
              {collectionVersion ? (
                <>
                  {deleteCollection.all_versions.length === 1 ? (
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
              onChange={(val) => onChange(val)}
              label={t`I understand that this action cannot be undone.`}
              id='delete_confirm'
            />
          </>
        </DeleteModal>
      )
    );
  }
}

export const deleteCollectionUtils = new DeleteCollectionUtils();
