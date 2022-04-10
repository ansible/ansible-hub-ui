export const canSign = ({ featureFlags }, namespace) => {
  const permissions = namespace?.related_fields?.my_permissions || [];
  return (
    featureFlags?.collection_signing &&
    permissions.includes('galaxy.change_namespace') &&
    permissions.includes('galaxy.upload_to_namespace')
  );
};
