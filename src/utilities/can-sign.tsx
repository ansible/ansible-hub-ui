import { FeatureFlagsType } from 'src/api';

export const canSignNamespace = (
  { featureFlags }: { featureFlags: FeatureFlagsType },
  namespace,
) => {
  const { can_create_signatures } = featureFlags;

  // TODO: fix RBAC namespaces
  const permissions = namespace?.related_fields?.my_permissions || [
    'galaxy.change_namespace',
    'galaxy.upload_to_namespace',
  ];

  return (
    // (can_create_signatures also implies signatures_enabled and collection_signing)
    can_create_signatures &&
    permissions.includes('galaxy.change_namespace') &&
    permissions.includes('galaxy.upload_to_namespace')
  );
};

export const canSignEE = (
  { featureFlags }: { featureFlags: FeatureFlagsType },
  container,
) => {
  const { container_signing } = featureFlags;
  const permissions = container.namespace.my_permissions;

  return (
    container_signing &&
    permissions.includes('container.change_containernamespace')
  );
};
