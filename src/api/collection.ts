import axios from 'axios';
import {
  AnsibleDistributionAPI,
  CollectionDetailType,
  CollectionListType,
  CollectionUploadType,
  CollectionVersionSearch,
} from 'src/api';
import { HubAPI } from './hub';

// return correct distro
export function findDistroBasePathByRepo(distributions, repository) {
  if (distributions.length === 0) {
    // if distribution doesn't exist, use repository name
    return repository.name;
  }

  // try to look for match by name, if not, just use the first distro
  const distro = distributions.find(
    (distro) => distro.name === repository.name,
  );

  return distro ? distro.base_path : distributions[0].base_path;
}

function filterContents(contents) {
  if (contents) {
    return contents.filter(
      (item) => !['doc_fragments', 'module_utils'].includes(item.content_type),
    );
  }

  return contents;
}

function filterListItem(item: CollectionListType) {
  return {
    ...item,
    latest_version: {
      ...item.latest_version,
      contents: null, // deprecated
      metadata: {
        ...item.latest_version.metadata,
        contents: filterContents(item.latest_version.metadata.contents),
      },
    },
  };
}

export class API extends HubAPI {
  apiPath = this.getUIPath('repo/');
  cachedCollection: CollectionDetailType;

  list(params?, repo?: string) {
    const path = this.apiPath + repo + '/';
    return super.list(params, path).then((response) => ({
      ...response,
      data: {
        ...response.data,
        // remove module_utils, doc_fragments from each item
        data: response.data.data.map(filterListItem),
      },
    }));
  }

  getPublishedCount(distributionPath: string) {
    return this.http
      .get(`v3/plugin/ansible/content/${distributionPath}/collections/index/`)
      .then((result) => {
        return result.data.meta.count;
      });
  }

  getExcludesCount(distributionPath: string) {
    return this.http
      .get(`content/${distributionPath}/v3/excludes/`)
      .then((result) => {
        return result.data;
      });
  }

  setDeprecation(
    collection: CollectionVersionSearch,
  ): Promise<{ data: { task: string } }> {
    const {
      collection_version: { namespace, name },
      repository,
      is_deprecated,
    } = collection;
    return new Promise((resolve, reject) => {
      AnsibleDistributionAPI.list({
        repository: repository.pulp_href,
      })
        .then((result) => {
          const basePath = findDistroBasePathByRepo(
            result.data.results,
            repository,
          );

          const path = `v3/plugin/ansible/content/${basePath}/collections/index/`;
          this.patch(
            `${namespace}/${name}`,
            {
              deprecated: !is_deprecated,
            },
            path,
          )
            .then((res) => resolve(res))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  upload(
    data: CollectionUploadType,
    progressCallback: (e) => void,
    cancelToken?,
  ) {
    const formData = new FormData();
    formData.append('file', data.file);
    // formData.append('sha256', artifact.sha256);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressCallback,
    };

    if (cancelToken) {
      config['cancelToken'] = cancelToken.token;
    }
    return this.http.post('v3/artifacts/collections/', formData, config);
  }

  getCancelToken() {
    return axios.CancelToken.source();
  }

  getDownloadURL(repository, namespace, name, version) {
    // UI API doesn't have tarball download link, so query it separately here
    return new Promise((resolve, reject) => {
      AnsibleDistributionAPI.list({
        repository: repository.pulp_href,
      })
        .then((result) => {
          const basePath = findDistroBasePathByRepo(
            result.data.results,
            repository,
          );

          this.http
            .get(
              `v3/plugin/ansible/content/${basePath}/collections/index/${namespace}/${name}/versions/${version}/`,
            )
            .then((result) => {
              resolve(result.data['download_url']);
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  async deleteCollectionVersion(collection: CollectionVersionSearch) {
    const distros = await AnsibleDistributionAPI.list({
      repository: collection.repository.pulp_href,
    });

    const distroBasePath = findDistroBasePathByRepo(
      distros.data.results,
      collection.repository,
    );

    return this.http.delete(
      `v3/plugin/ansible/content/${distroBasePath}/collections/index/${collection.collection_version.namespace}/${collection.collection_version.name}/versions/${collection.collection_version.version}/`,
    );
  }

  async deleteCollection(collection: CollectionVersionSearch) {
    const distros = await AnsibleDistributionAPI.list({
      repository: collection.repository.pulp_href,
    });

    const distroBasePath = findDistroBasePathByRepo(
      distros.data.results,
      collection.repository,
    );

    return this.http.delete(
      `v3/plugin/ansible/content/${distroBasePath}/collections/index/${collection.collection_version.namespace}/${collection.collection_version.name}/`,
    );
  }

  getUsedDependenciesByCollection(
    namespace,
    collection,
    params = {},
    cancelToken = undefined,
  ) {
    return this.http.get(
      this.getUIPath(
        `collection-versions/?dependency=${namespace}.${collection}`,
      ),
      { params: this.mapPageToOffset(params), cancelToken: cancelToken?.token },
    );
  }

  getSignatures(distroBasePath, namespace, name, version) {
    return this.http.get(
      `v3/plugin/ansible/content/${distroBasePath}/collections/index/${namespace}/${name}/versions/${version}/`,
    );
  }

  getContent(namespace, name, version) {
    return super.list(
      {
        namespace,
        name,
        version,
      },
      `pulp/api/v3/content/ansible/collection_versions/`,
    );
  }
}

export const CollectionAPI = new API();
