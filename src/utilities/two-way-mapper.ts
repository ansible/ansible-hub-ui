// Returns human value for DB permission and vise verse
export function getPermission(permission: string, mapper: any) {
  if (Object.values(mapper).includes(permission)) {
    return Object.keys(mapper).find(key => mapper[key] === permission);
  }
  if (Object.keys(mapper).includes(permission)) {
    return mapper[permission];
  }
  return undefined;
}
