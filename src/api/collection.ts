import { BaseAPI } from './base';
import {
  CollectionDetailType,
  CollectionListType,
  CollectionUploadType,
  UserType,
} from '../api';
import axios from 'axios';

export class API extends BaseAPI {
  apiPath = this.getUIPath('repo/');
  cachedCollection: CollectionDetailType;

  constructor() {
    super();
  }

  list(params?: any, repo?: string) {
    const path = this.apiPath + repo + '/';
    return super.list(params, path);
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
    repositoryPath: String,
    data: CollectionUploadType,
    progressCallback: (e) => void,
    cancelToken?: any,
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
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    return source;
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
    const path = `${this.apiPath}${repo}/${namespace}/${name}/`;
    if (
      !forceReload &&
      this.cachedCollection &&
      this.cachedCollection.name === name &&
      this.cachedCollection.namespace.name === namespace
    ) {
      return new Promise((resolve, reject) => {
        if (this.cachedCollection) {
          resolve(this.cachedCollection);
        } else {
          reject(this.cachedCollection);
        }
      });
    } else {
      return new Promise((resolve, reject) => {
        this.http
          .get(path, {
            params: params,
          })
          .then(result => {
            this.cachedCollection = result.data;
            resolve(result.data);
          })
          .catch(result => {
            reject(result);
          });
      });
    }
  }

  getDownloadURL(distro_base_path, namespace, name, version) {
    // UI API doesn't have tarball download link, so query it separately here
    return new Promise((resolve, reject) => {
      this.http
        .get(
          `content/${distro_base_path}/v3/collections/${namespace}/${name}/versions/${version}/`,
        )
        .then(result => {
          resolve(result.data['download_url']);
        })
        .catch(err => reject(err));
    });
  }
}

export const CollectionAPI = new API();
