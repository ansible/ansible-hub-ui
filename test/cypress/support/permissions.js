export default [
  {
    group: 'namespaces',
    permissions: [
      'Add namespace',
      'Change namespace',
      'Delete namespace',
      'Upload to namespace',
    ],
  },
  {
    group: 'collections',
    permissions: ['Modify Ansible repo content', 'Delete collection'],
  },
  {
    group: 'users',
    permissions: ['View user', 'Delete user', 'Add user', 'Change user'],
  },
  {
    group: 'groups',
    permissions: ['View group', 'Delete group', 'Add group', 'Change group'],
  },
  {
    group: 'remotes',
    permissions: ['Change collection remote', 'View collection remote'],
  },
  {
    group: 'containers',
    permissions: [
      'Delete container repository',
      'Change container namespace permissions',
      'Change containers',
      'Change image tags',
      'Create new containers',
      'Push to existing containers',
    ],
  },
  {
    group: 'registries',
    permissions: [
      'Add remote registry',
      'Change remote registry',
      'Delete remote registry',
    ],
  },
];
