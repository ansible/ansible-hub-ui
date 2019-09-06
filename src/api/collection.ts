import { BaseAPI } from './base';
import { MockCollection } from './mocked-responses/collection';
import { CollectionUploadType } from './response-types/collection';
import axios from 'axios';

class API extends BaseAPI {
    apiPath = 'v3/_ui/collections/';

    constructor() {
        super();

        // Comment this out to make an actual API request
        // mocked responses will be removed when a real API is available
        // new MockCollection(this.http, this.apiPath);
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
}

export const CollectionAPI = new API();
