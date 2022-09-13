// TODO - canSign can be renamed to canSignNS
export const canSign = ({ featureFlags }, namespace) => {
  const { can_create_signatures } = featureFlags || {};
  const permissions = namespace?.related_fields?.my_permissions || [];
  return (
    can_create_signatures &&
    permissions.includes('galaxy.change_namespace') &&
    permissions.includes('galaxy.upload_to_namespace')
  );
};

export const canSignEE = ({ featureFlags }, container) => {
  const { can_create_signatures, signatures_enabled, container_signing } =
    featureFlags || {};

  return (
    can_create_signatures &&
    signatures_enabled &&
    container_signing &&
    container.namespace.my_permissions.includes(
      'container.change_containernamespace',
    )
  );
};
