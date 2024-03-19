import { Paths, formatPath } from 'src/paths';

export function roleNamespaceInfo(data) {
  const summary_fields = data.summary_fields;
  let provider = null;

  if (summary_fields) {
    if ('provider_namespace' in summary_fields) {
      // role summary
      provider = data.summary_fields.provider_namespace;
    } else if (
      'provider_namespaces' in summary_fields &&
      summary_fields.provider_namespaces.length > 0
    ) {
      // role namespace summary
      provider = data.summary_fields.provider_namespaces[0];
    }
  }

  if (!provider) {
    return {
      id: null,
      name: null,
      url: null,
    };
  }

  return {
    id: provider.id || null,
    name: provider.name || null,
    url: provider.name
      ? formatPath(Paths.namespaceDetail, { namespace: provider.name })
      : null,
  };
}
