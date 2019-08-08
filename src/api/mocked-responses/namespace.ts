import * as MockAdapter from 'axios-mock-adapter';
import { NamespaceType, NamespaceListType } from '../../api';

export const redHat = {
    id: 1,
    name: 'red_hat',
    company: 'Red Hat',
    avatar_url:
        'https://www.redhat.com/cms/managed-files/styles/wysiwyg_full_width/s3/Logo-RedHat-Hat-Color-CMYK%20%281%29.jpg?itok=Mf0Ff9jq',
    description:
        'We’re the world’s leading provider of enterprise open source solutions, using a community-powered approach to deliver high-performing Linux, cloud, container, and Kubernetes technologies. We help you standardize across environments, develop cloud-native applications, and integrate, automate, secure, and manage complex environments with award-winning support, training, and consulting services.',
    resources_page: `[![Build Status](https://travis-ci.com/ansible/galaxy.svg?branch=devel)](https://travis-ci.com/ansible/galaxy)

# Ansible Galaxy

This is the source code behind Galaxy - https://galaxy.ansible.com.

For help using the public Galaxy web site to find and install Ansible content, or to share your Ansible content with the community, [visit the Galaxy docs site](https://galaxy.ansible.com/docs/).

## Installing

**NOTE:** Our installation guide is out of date. The old installer does not work with the latest architectural changes introduced in v3.0, and has since been removed from the devel branch. (The previously provided docker image was intended to be used by the old installer, and henceforth that image is now considered deprecated.  Our updated [contributing guide](./CONTRIBUTING.rst) now walks you through creating your own docker image)

**Local Install:** If you want to run Ansible Galaxy locally, follow our contributing guide: [contributing guide](./CONTRIBUTING.rst)

## Roadmap

To see what we're working on, and where we're headed, view the [road map](./ROADMAP.md)

## Change Log

To view a release history and what changed, [view our change log](./CHANGELOG.rst)

## Announcements

For the [galaxy.ansible.com](https://galaxy.ansible.com) site, get alerted when maintenance windows are scheduled, or when a release is scheduled to deploy, by subscribing to the [ansible-project](https://groups.google.com/group/ansible-project) Google group.

## Contributing

* If you're interested in jumping in and helping out, view the [contributing guide](./CONTRIBUTING.rst).
* Chat with us on irc.freenode.net: #ansible-galaxy

## Branch Information

* Releases are named after Daft Punk songs.
* The *devel* branch is the release actively under development.
* The *master* branch corresponds to the latest stable release.
* Submit pull requests for bug fixes and new features to *devel*.
* Various [release/X.Y.Z branches exist for previous releases](https://github.com/ansible/galaxy/tags).
* Contributors welcome! Get started by reviewing [CONTRIBUTING.md](./CONTRIBUTING.md).

## Authors

View [AUTHORS](./AUTHORS) for a list contributors to Ansible Galaxy. Thanks everyone!

Ansible Galaxy is an [Ansible by Red Hat](https://ansible.com) sponsored project.
`,
    useful_links: [
        { name: 'Red Hat', url: 'https://www.redhat.com' },
        {
            name: 'Cormier: "Ansible is a Platform"',
            url: 'https://www.redhat.com',
        },
    ],
    owners: [{ name: 'newswangerd' }],
    num_collections: 10,
} as NamespaceType;

export class MockNamespace {
    mock: any;

    constructor(http: any, apiPath: string) {
        this.mock = new MockAdapter(http, { delayResponse: 200 });
        this.mock.onGet(apiPath).reply(200, {
            links: {},
            meta: { count: 1 },
            data: this.getNSList(),
        });
        this.mock.onGet(apiPath + 'red_hat/').reply(200, this.getNSDetail());
        this.mock.onPut(apiPath + 'red_hat/').reply(204, this.ns1);
    }

    ns1 = redHat;

    ns2 = {
        id: 2,
        name: 'cisco',
        company: 'Cisco',
        num_collections: 1,
        avatar_url:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cisco_logo.svg/320px-Cisco_logo.svg.png',
    };

    ns3 = {
        id: 3,
        name: 'ansible',
        company: 'Ansible',
        num_collections: 90,
        avatar_url:
            'https://logos-download.com/wp-content/uploads/2016/10/Ansible_logo.png',
    };

    ns4 = {
        id: 4,
        name: 'google',
        company: 'Google Cloud',
        num_collections: 2,
        avatar_url:
            'https://cloud.google.com/_static/images/cloud/icons/favicons/onecloud/apple-icon.png',
    };

    getNSList() {
        return [this.ns1, this.ns2, this.ns3, this.ns4];
    }

    getNSDetail() {
        return this.ns1;
    }
}
