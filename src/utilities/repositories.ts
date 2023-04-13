import { t } from '@lingui/macro';
import { Repositories } from 'src/api/repositories';
import { CollectionVersionSearch } from 'src/api/response-types/collection';
import { Repository } from 'src/api/response-types/repositories';
import { waitForTaskUrl } from 'src/utilities';
import { parsePulpIDFromURL } from 'src/utilities/parse-pulp-id';

export class RepositoriesUtils {
  public static listApproved(): Promise<Repository[]> {
    async function getAll() {
      let list = [];

      let page = 0;
      const pageSize = 100;
      // watchdog, in case something terrible happened, loop maximum of 10 times. I hope 1000 repos limit is enough
      // otherwise, doing more than 10 API calls is not acceptable either
      for (let i = 0; i < 10; i++) {
        const result = await Repositories.http.get(
          `${
            Repositories.apiPath
          }?offset=${page}&limit=${pageSize}&pulp_label_select=${encodeURIComponent(
            'pipeline=approved',
          )}`,
        );

        list = list.concat(result.data.results);
        if (list.length >= result.data.count) {
          return list;
        }

        page += pageSize;
      }
    }

    return getAll();
  }

  public static async deleteOrAddCollection(
    repoName,
    collectionVersion_pulp_href,
    add,
  ) {
    let data = await Repositories.getRepository({ name: repoName });

    if (data.data.results.length == 0) {
      return Promise.reject({ error: t`Repository ${repoName} not found.` });
    }

    const repo = data.data.results[0];
    const pulp_id = parsePulpIDFromURL(repo.pulp_href);

    const addList = [];
    const removeList = [];

    if (add) {
      addList.push(collectionVersion_pulp_href);
    } else {
      removeList.push(collectionVersion_pulp_href);
    }

    data = await Repositories.modify(
      pulp_id,
      addList,
      removeList,
      repo.latest_version_href,
    );

    data = await waitForTaskUrl(data.data['task']);
  }

  public static async deleteCollection(repoName, collectionVersion_pulp_href) {
    return RepositoriesUtils.deleteOrAddCollection(
      repoName,
      collectionVersion_pulp_href,
      false,
    );
  }

  public static async addCollection(repoName, collectionVersion_pulp_href) {
    return RepositoriesUtils.deleteOrAddCollection(
      repoName,
      collectionVersion_pulp_href,
      true,
    );
  }

  public static pushToOrFilterOutCollections(
    selectedCollection: CollectionVersionSearch,
    collections: CollectionVersionSearch[],
  ): CollectionVersionSearch[] {
    // check if collection is already selected
    const selectedItem = collections.find(
      ({ collection_version: { name, namespace, version }, repository }) =>
        name === selectedCollection.collection_version.name &&
        namespace === selectedCollection.collection_version.namespace &&
        version === selectedCollection.collection_version.version &&
        repository.name === selectedCollection.repository.name,
    );

    // if collection is not selected, add it to selected items
    if (!selectedItem) {
      return [...collections, selectedCollection];
    }

    // unselect collection
    return collections.filter(
      ({ collection_version, repository }) =>
        collection_version.name !==
          selectedCollection.collection_version.name ||
        collection_version.namespace !==
          selectedCollection.collection_version.namespace ||
        collection_version.version !==
          selectedCollection.collection_version.version ||
        repository.name !== selectedCollection.repository.name,
    );
  }
}
