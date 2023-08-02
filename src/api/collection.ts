import axios from 'axios';
import { repositoryBasePath } from 'src/utilities';
import { HubAPI } from './hub';
import {
  CollectionDetailType,
  CollectionListType,
  CollectionUploadType,
  CollectionVersionSearch,
} from './response-types/collection';

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

  async setDeprecation({
    collection_version: { namespace, name },
    repository,
    is_deprecated,
  }: CollectionVersionSearch): Promise<{ data: { task: string } }> {
    const distroBasePath = await repositoryBasePath(
      repository.name,
      repository.pulp_href,
    );

    return this.patch(
      `${namespace}/${name}`,
      {
        deprecated: !is_deprecated,
      },
      `v3/plugin/ansible/content/${distroBasePath}/collections/index/`,
    );
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

    if (data.distro_base_path) {
      return this.http.post(
        `v3/plugin/ansible/content/${data.distro_base_path}/collections/artifacts/`,
        formData,
        config,
      );
    } else {
      return this.http.post('v3/artifacts/collections/', formData, config);
    }
  }

  getCancelToken() {
    return axios.CancelToken.source();
  }

  async getDownloadURL(repository, namespace, name, version) {
    // UI API doesn't have tarball download link, so query it separately here
    const distroBasePath = await repositoryBasePath(
      repository.name,
      repository.pulp_href,
    );

    return this.http
      .get(
        `v3/plugin/ansible/content/${distroBasePath}/collections/index/${namespace}/${name}/versions/${version}/`,
      )
      .then(({ data: { download_url } }) => download_url);
  }

  async deleteCollectionVersion({
    collection_version: { namespace, name, version },
    repository,
  }: CollectionVersionSearch) {
    const distroBasePath = await repositoryBasePath(
      repository.name,
      repository.pulp_href,
    );

    return this.http.delete(
      `v3/plugin/ansible/content/${distroBasePath}/collections/index/${namespace}/${name}/versions/${version}/`,
    );
  }

  async deleteCollection({
    collection_version: { namespace, name },
    repository,
  }: CollectionVersionSearch) {
    const distroBasePath = await repositoryBasePath(
      repository.name,
      repository.pulp_href,
    );

    return this.http.delete(
      `v3/plugin/ansible/content/${distroBasePath}/collections/index/${namespace}/${name}/`,
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

  async getSignatures(repository, namespace, name, version) {
    const distroBasePath = await repositoryBasePath(
      repository.name,
      repository.pulp_href,
    );

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
