import { BaseAPI } from './base';
import { CertificationStatus } from '../api';

export class API extends BaseAPI {
    apiPath = 'v3/_ui/collection-versions/';

    constructor() {
        super();
    }

    setCertifiation(
        namespace: string,
        collection: string,
        version: string,
        certification: CertificationStatus,
    ) {
        const path = 'v3/collections/';
        const id = `${namespace}/${collection}/versions/${version}/certified`;

        return this.update(
            id,
            {
                namespace: namespace,
                name: collection,
                version: version,
                certification: certification,
            },
            path,
        );
    }
}

export const CollectionVersionAPI = new API();
