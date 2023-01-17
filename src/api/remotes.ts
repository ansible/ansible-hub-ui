import { BaseAPI } from './base';
import { RemoteType } from '.';
import { clearSetFieldsFromRequest } from 'src/utilities';

class API extends BaseAPI {
  apiPath = this.getUIPath('remotes/');

  constructor() {
    super();
  }

  // removes unchanged values and write only fields before
  // can't override the base class update method because this function takes a
  // third parameter and update only takes 2
  smartUpdate(distribution, remote: RemoteType, unModifiedRemote: RemoteType) {
    // Deletes any write only fields from the object that are market as is_set.
    // This is to prevent accidentally clearing fields that weren't updated.

    // TODO: clearing set fields from the response will be unnecesary if the API
    // stops returning field: null on write only fields
    const reducedData: RemoteType = clearSetFieldsFromRequest(
      remote,
      remote.write_only_fields,
    ) as RemoteType;

    // Pulp complains if auth_url gets sent with a request that doesn't include a
    // valid token, even if the token exists in the database and isn't being changed.
    // To solve this issue, simply delete auth_url from the request if it hasn't
    // been updated by the user.
    if (reducedData.auth_url === unModifiedRemote.auth_url) {
      delete reducedData['auth_url'];
    }

    for (const field of Object.keys(reducedData)) {
      if (reducedData[field] === '') {
        reducedData[field] = null;
      }
    }

    return this.http.put(
      `content/${distribution}/v3/sync/config/`,
      reducedData,
    );
  }

  update(id, obj) {
    throw 'use smartUpdate()';
  }

  sync(distribution) {
    return this.http.post(`content/${distribution}/v3/sync/`, {});
  }
}

export const RemoteAPI = new API();
