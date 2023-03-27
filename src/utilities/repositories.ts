import { t } from '@lingui/macro';
import { CollectionVersionAPI } from 'src/api/collection-version';
import { Repositories } from 'src/api/repositories';
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

  public static async deleteOrAddCollection(repoName, collectionVersion, add) {
    let data = await Repositories.getRepository({ name: repoName });

    if (data.data.results.length == 0) {
      return Promise.reject({ error: t`Repository ${repoName} not found.` });
    }

    const repo = data.data.results[0];
    const pulp_id = parsePulpIDFromURL(repo.pulp_href);

    data = await CollectionVersionAPI.get(collectionVersion.id);

    const version_pulp_href = data.data['pulp_href'];

    const addList = [];
    const removeList = [];

    if (add) {
      addList.push(version_pulp_href);
    } else {
      removeList.push(version_pulp_href);
    }

    data = await Repositories.modify(
      pulp_id,
      addList,
      removeList,
      repo.latest_version_href,
    );

    data = await waitForTaskUrl(data.data['task']);
  }

  public static async deleteCollection(repoName, collectionVersion) {
    return RepositoriesUtils.deleteOrAddCollection(
      repoName,
      collectionVersion,
      false,
    );
  }

  public static async addCollection(repoName, collectionVersion) {
    return RepositoriesUtils.deleteOrAddCollection(
      repoName,
      collectionVersion,
      true,
    );
  }
}
