export const canSign = ({ featureFlags }, namespace) => {
  const { signatures_enabled, can_create_signatures } = featureFlags || {};
  const permissions = namespace?.related_fields?.my_permissions || [];
  return (
    signatures_enabled &&
    can_create_signatures &&
    permissions.includes('galaxy.change_namespace') &&
    permissions.includes('galaxy.upload_to_namespace')
  );
};
