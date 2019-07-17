import * as MockAdapter from 'axios-mock-adapter';
import { Namespace } from '../response-types/namespace';

export class MockNamespace {
    mock: any;

    constructor(http: any, apiPath: string) {
        this.mock = new MockAdapter(http);
        this.mock.onGet(apiPath).reply(200, this.getNSList());
        this.mock
            .onGet(apiPath + 'newswangerd/')
            .reply(200, this.getNSDetail());
    }

    ns1 = {
        name: 'red_hat',
        company: 'Red Hat',
        avatar_url:
            'https://www.redhat.com/cms/managed-files/styles/wysiwyg_full_width/s3/Logo-RedHat-Hat-Color-CMYK%20%281%29.jpg?itok=Mf0Ff9jq',
        description:
            'We’re the world’s leading provider of enterprise open source solutions, using a community-powered approach to deliver high-performing Linux, cloud, container, and Kubernetes technologies. We help you standardize across environments, develop cloud-native applications, and integrate, automate, secure, and manage complex environments with award-winning support, training, and consulting services.',
        resources_page_src: '',
        resources_page_html: '',
        useful_links: [{ name: 'Red Hat', url: 'https://www.redhat.com' }],
        owners: [{ name: 'newswangerd' }],
    } as Namespace;

    getNSList() {
        return [this.ns1];
    }

    getNSDetail() {
        return this.ns1;
    }
}
