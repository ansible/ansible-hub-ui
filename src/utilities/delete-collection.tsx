import { Trans, t } from '@lingui/macro';
import { DropdownItem, Tooltip } from '@patternfly/react-core';
import React from 'react';
import {
  CollectionAPI,
  CollectionVersionAPI,
  CollectionVersionSearch,
} from 'src/api';
import {
  RepositoriesUtils,
  errorMessage,
  parsePulpIDFromURL,
  waitForTask,
} from 'src/utilities';

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
    deleteAll,
    display_repositories,
  }) {
    if (!canDeleteCollection) {
      return null;
    }

    if (!display_repositories && !deleteAll) {
      // cant display delete from repository when repositories are turned off
      return null;
    }

    const caption = deleteAll
      ? t`Delete entire collection from system`
      : t`Delete collection from repository`;

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
          <DropdownItem isDisabled>{caption}</DropdownItem>
        </Tooltip>
      );
    }

    return (
      <DropdownItem
        key='delete-collection-enabled'
        onClick={onClick}
        data-cy={
          deleteAll
            ? 'delete-collection-dropdown'
            : 'delete-collection-from-repo-dropdown'
        }
      >
        {caption}
      </DropdownItem>
    );
  }

  public static tryOpenDeleteModalWithConfirm({
    addAlert,
    setState,
    collection,
    deleteAll,
  }) {
    DeleteCollectionUtils.getUsedbyDependencies(collection)
      .then((noDependencies) =>
        DeleteCollectionUtils.openDeleteModalWithConfirm({
          addAlert,
          setState,
          noDependencies,
          collection,
          deleteAll,
        }),
      )
      .catch((alert) => addAlert(alert));
  }

  private static openDeleteModalWithConfirm({
    addAlert,
    setState,
    noDependencies,
    collection,
    deleteAll,
  }) {
    if (noDependencies) {
      setState({
        deleteCollection: collection,
        confirmDelete: false,
        deleteAll: deleteAll,
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
    }
  }

  public static deleteCollection({
    collection,
    setState,
    load,
    redirect,
    addAlert,
    deleteFromRepo,
  }) {
    let promise = null;
    if (deleteFromRepo) {
      promise = RepositoriesUtils.deleteCollection(
        deleteFromRepo,
        collection.collection_version.pulp_href,
      );
    } else {
      promise = CollectionAPI.deleteCollection(collection);
    }

    promise
      .then((res) => {
        if (!deleteFromRepo) {
          const taskId = parsePulpIDFromURL(res.data.task);
          return waitForTask(taskId);
        }
      })
      .then(() => {
        addAlert({
          variant: 'success',
          title: (
            <Trans>
              Collection &quot;{collection.collection_version.name}
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
