import { LegacyAPI } from './legacy';
import {
  CollectionDetailType,
  CollectionListType,
  CollectionUploadType,
  LegacyUserDetailType,
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
    latest_version: '',
  };
}

export class API extends LegacyAPI {
  apiPath = this.getApiPath('');
  cachedLegacyUser: LegacyUserDetailType;

  constructor() {
    super();
  }

  list(params?) {
    //const path = this.apiPath + '/';
    const path = this.apiPath;
    console.log('API this.apiPath', path);
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
    github_user,
    name,
    params?,
    forceReload?: boolean,
  ): Promise<LegacyUserDetailType> {
    if (
      !forceReload &&
      this.cachedLegacyUser &&
      this.cachedLegacyUser.username === name
    ) {
      return Promise.resolve(this.cachedLegacyUser);
    }

    //const path = `${this.apiPath}${repo}/${namespace}/${name}/`;
    const path = `${this.apiPath}/${github_user}/${name}/`;
    console.log('PATH', path);

  }
}

export const LegacyUserAPI = new API();
