import { Trans, t } from '@lingui/macro';
import { DropdownItem, Tooltip } from '@patternfly/react-core';
import React from 'react';
import {
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
} from 'src/api';
import { errorMessage, parsePulpIDFromURL, waitForTask } from 'src/utilities';

export class DeleteCollectionUtils {
  public static getUsedbyDependencies(collection: CollectionVersionSearch) {
    const { name, namespace } = collection.collection_version;
    return CollectionVersionAPI.getUsedDependenciesByCollection(namespace, name)
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

  public static deleteCollection({
    collection,
    setState,
    load,
    redirect,
    addAlert,
  }) {
    CollectionAPI.deleteCollection(collection)
      .then((res) => {
        const taskId = parsePulpIDFromURL(res.data.task);
        const name = collection.collection_version.name;

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

          if (redirect) {
            setState({ redirect });
          }

          if (load) {
            load();
          }
        });
      })
      .catch((err) => {
        const { status, statusText } = err.response;

        addAlert({
          variant: 'danger',
          title: t`Collection "${collection.collection_version.name}" could not be deleted.`,
          description: errorMessage(status, statusText),
        });
      })
      .finally(() =>
        setState({
          deleteCollection: null,
          isDeletionPending: false,
        }),
      );
  }
}
