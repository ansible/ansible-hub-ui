import { PulpAPI } from './pulp';
import { AnsibleRemoteType } from './response-types/ansible-remote';

// simplified version of smartUpdate from remote.ts
function smartUpdate(
  remote: AnsibleRemoteType,
  unmodifiedRemote: AnsibleRemoteType,
) {
  // Pulp complains if auth_url gets sent with a request that doesn't include a
  // valid token, even if the token exists in the database and isn't being changed.
  // To solve this issue, simply delete auth_url from the request if it hasn't
  // been updated by the user.
  if (remote.auth_url === unmodifiedRemote.auth_url) {
    delete remote.auth_url;
  }

  for (const field of Object.keys(remote)) {
    if (remote[field] === '') {
      remote[field] = null;
    }

    // API returns headers:null bull doesn't accept it .. and we don't edit headers
    if (remote[field] === null && unmodifiedRemote[field] === null) {
      delete remote[field];
    }
  }

  return remote;
}

class API extends PulpAPI {
  apiPath = 'remotes/ansible/collection/';
  useOrdering = true;

  // create(data)
  // delete(uuid)
  // list(params?)

  smartUpdate(pk, newValue: AnsibleRemoteType, oldValue: AnsibleRemoteType) {
    const reducedData = smartUpdate(newValue, oldValue);
    return super.update(pk, reducedData);
  }

  update(_id, _obj) {
    throw 'use smartUpdate()';
  }

  listRoles(id, params?) {
    return super.list(params, this.apiPath + id + '/list_roles/');
  }

  addRole(id, role) {
    return super.create(role, this.apiPath + id + '/add_role/');
  }

  myPermissions(id, params?) {
    return super.list(params, this.apiPath + id + '/my_permissions/');
  }

  removeRole(id, role) {
    return super.create(role, this.apiPath + id + '/remove_role/');
  }
}

export const AnsibleRemoteAPI = new API();
