import { HubAPI } from './hub';
import {
  CollectionDetailType,
  CollectionListType,
  CollectionUploadType,
} from 'src/api';
import axios from 'axios';

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

function filterDetailItem(item: CollectionDetailType) {
  return {
    ...item,
    latest_version: {
      ...item.latest_version,
      contents: null, // deprecated
      docs_blob: {
        ...item.latest_version.docs_blob,
        contents: filterContents(item.latest_version.docs_blob.contents),
      },
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

  setDeprecation(
    collection: CollectionListType,
    isDeprecated: boolean,
    repo: string,
  ) {
    const path = `content/${repo}/v3/collections/`;

    return this.patch(
      `${collection.namespace.name}/${collection.name}`,
      {
        deprecated: isDeprecated,
      },
      path,
    );
  }

  upload(
    repositoryPath: string,
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
    return this.http.post(
      'content/' + repositoryPath + '/v3/artifacts/collections/',
      formData,
      config,
    );
  }

  getCancelToken() {
    return axios.CancelToken.source();
  }

  // Caches the last collection returned from the server. If the requested
  // collection matches the cache, return it, if it doesn't query the API
  // for the collection and replace the old cache with the new value.
  // This allows the collection page to be broken into separate components
  // and routed separately without fetching redundant data from the API
  getCached(
    namespace,
    name,
    repo,
    params?,
    forceReload?: boolean,
  ): Promise<CollectionDetailType> {
    if (
      !forceReload &&
      this.cachedCollection &&
      this.cachedCollection.name === name &&
      this.cachedCollection.namespace.name === namespace
    ) {
      return Promise.resolve(this.cachedCollection);
    }

    const path = `${this.apiPath}${repo}/${namespace}/${name}/`;
    return this.http
      .get(path, {
        params: params,
      })
      .then((result) => {
        // remove module_utils, doc_fragments from item
        const item = filterDetailItem(result.data);
        this.cachedCollection = item;
        return item;
      });
  }

  getDownloadURL(distro_base_path, namespace, name, version) {
    // UI API doesn't have tarball download link, so query it separately here
    return new Promise((resolve, reject) => {
      this.http
        .get(
          `content/${distro_base_path}/v3/collections/${namespace}/${name}/versions/${version}/`,
        )
        .then((result) => {
          resolve(result.data['download_url']);
        })
        .catch((err) => reject(err));
    });
  }

  deleteCollectionVersion(repo, collection) {
    return this.http.delete(
      `content/${repo}/v3/collections/${collection.namespace.name}/${collection.name}/versions/${collection.latest_version.version}/`,
    );
  }

  deleteCollection(repo, collection) {
    return this.http.delete(
      `content/${repo}/v3/collections/${collection.namespace.name}/${collection.name}/`,
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
}

export const CollectionAPI = new API();
