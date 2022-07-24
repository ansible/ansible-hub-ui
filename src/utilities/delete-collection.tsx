import { t, Trans } from '@lingui/macro';
import React from 'react';
import { DropdownItem, Tooltip } from '@patternfly/react-core';
import { CollectionAPI } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { errorMessage, parsePulpIDFromURL, waitForTask } from 'src/utilities';

export class DeleteCollectionUtils {
  public static getUsedbyDependencies(collection) {
    const { name, namespace } = collection;
    return CollectionAPI.getUsedDependenciesByCollection(namespace.name, name)
      .then(({ data }) => data.data.length === 0)
      .catch((err) => {
        const { status, statusText } = err.response;
        return Promise.reject({
          title: t`Dependencies for collection "${name}" could not be displayed.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
  }

  public static deleteMenuOption({
    canDeleteCollection,
    noDependencies,
    onClick,
  }) {
    if (!canDeleteCollection) {
      return null;
    }

    if (noDependencies === false) {
      return (
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
          <DropdownItem isDisabled>{t`Delete entire collection`}</DropdownItem>
        </Tooltip>
      );
    }

    return (
      <DropdownItem
        key='delete-collection-enabled'
        onClick={onClick}
        data-cy='delete-collection-dropdown'
      >
        {t`Delete entire collection`}
      </DropdownItem>
    );
  }

  public static tryOpenDeleteModalWithConfirm({
    addAlert,
    setState,
    collection,
  }) {
    DeleteCollectionUtils.getUsedbyDependencies(collection)
      .then((noDependencies) =>
        DeleteCollectionUtils.openDeleteModalWithConfirm({
          addAlert,
          setState,
          noDependencies,
          collection,
        }),
      )
      .catch((alert) => addAlert(alert));
  }

  private static openDeleteModalWithConfirm({
    addAlert,
    setState,
    noDependencies,
    collection,
  }) {
    if (noDependencies) {
      setState({
        deleteCollection: collection,
        confirmDelete: false,
      });
    } else {
      addAlert({
        title: (
          <Trans>
            Cannot delete until collections <br />
            that depend on this collection <br />
            have been deleted.
          </Trans>
        ),
        variant: 'warning',
      });

      setState({
        deleteCollection: collection,
        confirmDelete: false,
      });
    }
  }

  public static deleteCollection(
    state,
    setState,
    load,
    redirect,
    selectedRepo,
    addAlert,
  ) {
    const { deleteCollection, collectionVersion } = state;

    CollectionAPI.deleteCollection(selectedRepo, deleteCollection)
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);

        const name =
          deleteCollection.name +
          (collectionVersion ? 'v ' + collectionVersion : '');

        waitForTask(taskId).then(() => {
          addAlert({
            variant: 'success',
            title: (
              <Trans>
                Collection &quot;{name}
                &quot; has been successfully deleted.
              </Trans>
            ),
          });

          setState({
            collectionVersion: null,
            deleteCollection: null,
            isDeletionPending: false,
          });

          if (redirect) {
            setState({
              redirect: formatPath(Paths.namespaceByRepo, {
                repo: selectedRepo,
                namespace: deleteCollection.namespace.name,
              }),
            });
          } else {
            if (load) {
              load();
            }
          }
        });
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        setState({
          collectionVersion: null,
          deleteCollection: null,
          isDeletionPending: false,
        });

        addAlert({
          variant: 'danger',
          title: t`Collection "${name}" could not be deleted.`,
          description: errorMessage(status, statusText),
        });
      });
  }
}
