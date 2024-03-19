import { t } from '@lingui/macro';
import {
  CollectionAPI,
  CollectionVersionAPI,
  type CollectionVersionSearch,
} from 'src/api';
import { errorMessage } from './fail-alerts';
import { parsePulpIDFromURL } from './parse-pulp-id';
import { repositoryRemoveCollection } from './repository-remove-collection';
import { waitForTask } from './wait-for-task';

export class DeleteCollectionUtils {
  public static countUsedbyDependencies(collection: CollectionVersionSearch) {
    const { name, namespace } = collection.collection_version;
    return CollectionVersionAPI.getUsedDependenciesByCollection(namespace, name)
      .then(({ data }) => data.data.length)
      .catch((err) => {
        const { status, statusText } = err.response;
        return Promise.reject({
          title: t`Dependencies for collection "${name}" could not be displayed.`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
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
      promise = repositoryRemoveCollection(
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
          title: t`Collection "${collection.collection_version.name}" has been successfully deleted.`,
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
