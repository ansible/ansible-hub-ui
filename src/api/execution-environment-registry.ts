import { clearSetFieldsFromRequest } from 'src/utilities';
import { type RemoteType } from '.';
import { HubAPI } from './hub';

// removes unchanged values and write only fields before updating
function smartUpdate(remote: RemoteType, unmodifiedRemote: RemoteType) {
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
  if (reducedData.auth_url === unmodifiedRemote.auth_url) {
    delete reducedData['auth_url'];
  }

  for (const field of Object.keys(reducedData)) {
    if (reducedData[field] === '') {
      reducedData[field] = null;
    }
  }

  return reducedData;
}

class API extends HubAPI {
  apiPath = '_ui/v1/execution-environments/registries/';

  // list(params?)
  // create(data)
  // get(name)
  // delete(name)

  smartUpdate(pk, newValue: RemoteType, oldValue: RemoteType) {
    const reducedData = smartUpdate(newValue, oldValue);
    return super.update(pk, reducedData);
  }

  update(_id, _obj) {
    throw 'use smartUpdate()';
  }

  index(id) {
    return this.http.post(this.apiPath + id + '/index/', {});
  }

  sync(id) {
    return this.http.post(this.apiPath + id + '/sync/', {});
  }
}

export const ExecutionEnvironmentRegistryAPI = new API();
