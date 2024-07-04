import { type FeatureFlagsType } from 'src/api';

export const canSignNamespace = (
  { featureFlags }: { featureFlags: FeatureFlagsType },
  namespace,
) => {
  const { can_create_signatures } = featureFlags;
  const permissions = namespace?.related_fields?.my_permissions || [];

  return (
    // (can_create_signatures also implies signatures_enabled and collection_signing)
    can_create_signatures &&
    permissions.includes('galaxy.change_namespace') &&
    permissions.includes('galaxy.upload_to_namespace')
  );
};
