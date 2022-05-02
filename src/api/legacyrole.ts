import { LegacyAPI } from './legacy';
import {
  CollectionDetailType,
  CollectionListType,
  CollectionUploadType,
  LegacyRoleDetailType
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

export class API extends LegacyAPI {
  apiPath = this.getApiPath('roles/');
  cachedCollection: CollectionDetailType;

  constructor() {
    super();
  }

  list(params?) {
    const path = this.apiPath + '/';
    return super.list(params, path).then((response) => ({
      ...response,
      data: {
        ...response.data,
        // remove module_utils, doc_fragments from each item
        data: response.data.data.map(filterListItem),
      },
    }));
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
    params?,
    forceReload?: boolean,
  ): Promise<LegacyRoleDetailType> {
    if (
      !forceReload &&
      this.cachedLegacyRole &&
      this.cachedLegacyRole.name === name &&
      this.cachedLegacyRole.namespace.name === namespace
    ) {
      return Promise.resolve(this.cachedLegacyRole);
    }

    //const path = `${this.apiPath}${repo}/${namespace}/${name}/`;
    const path = `${this.apiPath}/${namespace}/${name}/`;
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

}

export const LegacyRoleAPI = new API();
