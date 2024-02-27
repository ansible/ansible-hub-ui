import { sortBy } from 'lodash';

export const assignRoles = (roles) => {
  const userRoles = {};
  const groupRoles = {};

  roles.forEach(({ users, groups, role }) => {
    (users || []).forEach((username) => {
      userRoles[username] ||= [];
      userRoles[username].push(role);
    });
    (groups || []).forEach((name) => {
      groupRoles[name] ||= [];
      groupRoles[name].push(role);
    });
  });

  return {
    users: sortBy(
      Object.entries(userRoles).map(([username, object_roles]) => ({
        username,
        object_roles,
      })),
      'username',
    ),
    groups: sortBy(
      Object.entries(groupRoles).map(([name, object_roles]) => ({
        name,
        object_roles,
      })),
      'name',
    ),
  };
};
