import { LegacyAPI } from './legacy';
import {
  CollectionDetailType,
  CollectionListType,
  CollectionUploadType,
  LegacyRoleDetailType,
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
  cachedLegacyRole: LegacyRoleDetailType;

  constructor() {
    super();
  }

  list(params?) {
    //const path = this.apiPath + '/';
    const path = this.apiPath;
    console.log('Legacy Role API this.apiPath', path);
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
  ): Promise<LegacyRoleDetailType> {
    if (
      !forceReload &&
      this.cachedLegacyRole &&
      this.cachedLegacyRole.name === name &&
      this.cachedLegacyRole.github_user === github_user
    ) {
      return Promise.resolve(this.cachedLegacyRole);
    }

    //const path = `${this.apiPath}${repo}/${namespace}/${name}/`;
    const path = `${this.apiPath}/${github_user}/${name}/`;
    console.log('PATH', path);

    /*
    return this.http
      .get(path, {
        params: params,
      })
      .then((result) => {
        // remove module_utils, doc_fragments from item
        const item = filterDetailItem(result.data);
        this.cachedLegacyRole = item;
        return item;
      });
    */
    //return ("foobar");
  }
}

export const LegacyRoleAPI = new API();
