export function getProviderInfo(data) {
  let provider = null;

  if (data.summary_fields.hasOwnProperty('provider_namespace')) {
    // role summary
    provider = data.summary_fields.provider_namespace;
  } else if (data.summary_fields.hasOwnProperty('provider_namespaces')) {
    // legacy namespace summary
    provider = data.summary_fields.provider_namespaces[0];
  }

  if (provider === null || provider === undefined) {
    return {
      id: null,
      name: null,
      url: null,
    };
  }

  return {
    id: provider.id,
    name: provider.name,
    url: `/namespaces/${provider.name}`,
  };
}
