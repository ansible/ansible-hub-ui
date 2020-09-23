import { Constants } from '../constants';
// Returns human value for DB permission and vise verse
export function getPermission(permission: string) {
  if (Object.values(Constants.HUMAN_PERMISSIONS).includes(permission)) {
    return Object.keys(Constants.HUMAN_PERMISSIONS).find(
      key => Constants.HUMAN_PERMISSIONS[key] === permission,
    );
  }
  if (Object.keys(Constants.HUMAN_PERMISSIONS).includes(permission)) {
    return Constants.HUMAN_PERMISSIONS[permission];
  }
  return undefined;
}
