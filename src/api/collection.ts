import { BaseAPI } from './base';
import { MockCollection } from './mocked-responses/collection';
import { CollectionDetailType, CollectionUploadType } from '../api';
import axios from 'axios';

export class API extends BaseAPI {
    apiPath = 'v3/_ui/collections/';
    cachedCollection: CollectionDetailType;

    constructor() {
        super();

        // Comment this out to make an actual API request
        // mocked responses will be removed when a real API is available
        new MockCollection(this.http, this.apiPath);
    }

    upload(
        data: CollectionUploadType,
        progressCallback: (e) => void,
        cancelToken?: any,
    ) {
        const formData = new FormData();
        formData.append('file', data.file);
        // formData.append('sha256', artifact.sha256);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: progressCallback,
        };

        if (cancelToken) {
            config['cancelToken'] = cancelToken.token;
        }

        return this.http.post('v3/artifacts/collections/', formData, config);
    }

    getCancelToken() {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        return source;
    }

    // Caches the last collection returned from the server. If the requested
    // collection matches the cache, return it, if it doesn't query the API
    // for the collection and replace the old cache with the new value.
    // This allows the collection page to be broken into separate components
    // and routed separately without fetching redundant data from the API
    getCached(
        namespace,
        name,
        params?,
        forceReload?: boolean,
    ): Promise<CollectionDetailType> {
        if (
            !forceReload &&
            this.cachedCollection &&
            this.cachedCollection.name === name &&
            this.cachedCollection.namespace.name === namespace
        ) {
            return new Promise((resolve, reject) => {
                if (this.cachedCollection) {
                    resolve(this.cachedCollection);
                } else {
                    reject(this.cachedCollection);
                }
            });
        } else {
            return new Promise((resolve, reject) => {
                this.http
                    .get(`${this.apiPath}${namespace}/${name}/`, {
                        params: params,
                    })
                    .then(result => {
                        this.cachedCollection = result.data;
                        resolve(result.data);
                    })
                    .catch(result => {
                        reject(result);
                    });
            });
        }
    }
}

export const CollectionAPI = new API();
