export function getProviderInfo(legacynamespace) {

    const provider = legacynamespace.summary_fields.provider_namespaces[0];

    if (provider === null || provider === undefined) {  
        return {
            'id': null,
            'name': null,
            'url': null,
        }
    }

    return {
        'id': provider.id,
        'name': provider.name,
        'url': `/namespaces/${provider.name}`
    }
}
