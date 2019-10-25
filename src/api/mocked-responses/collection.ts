import * as MockAdapter from 'axios-mock-adapter';
import { CollectionListType, CollectionDetailType } from '../../api';
import { redHat, google } from './namespace';
import { RandomGenerator } from './generator';

export class MockCollection {
    mock: any;
    collectionNames = [
        // 'epel',
        // 'collection_demo',
        // 'a_collection_with_a_really_annoying_long_name',
        'community',
        // 'kitchen_sink',
        // 'bathroom_sink',
        // 'outdoor_sink',
        'network',
        'os',
        'cloud',
        'crypto',
        'monitoring',
        'messaging',
        'packaging',
        'openshift',
    ];

    constructor(http: any, apiPath: string) {
        const collectionList = this.getCollectionList();

        this.mock = new MockAdapter(http, { delayResponse: 200 });

        this.mock
            .onGet(apiPath + 'red_hat/collection_demo/')
            .reply(200, this.getCollectionDetail(collectionList[0]));

        this.mock
            .onGet(apiPath, {
                params: { keywords: 'epel', offset: 0, limit: 10 },
            })
            .reply(200, {
                meta: { count: 1 },
                links: {},
                data: [collectionList[0]],
            });

        this.mock
            .onGet(apiPath, { params: { offset: 10, limit: 10 } })
            .reply(200, {
                meta: { count: collectionList.length },
                links: {},
                data: collectionList.slice(10, 19),
            });

        this.mock.onGet(apiPath, {}).reply(200, {
            meta: { count: collectionList.length },
            links: {},
            data: collectionList.slice(0, 9),
        });
    }

    getCollectionList() {
        const collections = [] as CollectionListType[];

        for (let i = 0; i < this.collectionNames.length; i++) {
            collections.push(
                CollectionGenerator.generate(
                    i,
                    this.collectionNames[i],
                    redHat,
                ),
            );
        }

        return collections;
    }

    getCollectionDetail(collection: CollectionListType): CollectionDetailType {
        return CollectionGenerator.generateDetail(collection);
    }
}

class CollectionGenerator extends RandomGenerator {
    static generate(id, name, namespace): CollectionListType {
        const collection = {
            id: id,
            name: name,
            download_count: this.randNum(10 ** (this.randNum(8) + 1)),
            namespace: namespace,

            latest_version: {
                id: id,
                version: `${this.randNum(5)}.${this.randNum(10)}.${this.randNum(
                    100,
                )}`,
                created_at: this.randDate(
                    new Date(2016, 0, 1),
                    new Date(),
                ).toString(),
                metadata: {
                    tags: this.randWords(9),
                    description: this.lipsum.substring(
                        0,
                        this.randNum(this.lipsum.length),
                    ),
                },

                contents: [
                    {
                        name: 'factoid',
                        description: null,
                        content_type: 'role',
                    },
                    {
                        name: 'deltoid',
                        description: null,
                        content_type: 'role',
                    },
                    {
                        name: 'real_facts',
                        description: 'A module that dishes out the true facts.',
                        content_type: 'module',
                    },
                ],
            },
        } as CollectionListType;

        return collection;
    }

    static generateDetail(
        collection: CollectionListType,
    ): CollectionDetailType {
        const latest_version = collection.latest_version as any;

        latest_version.metadata = {
            ...collection.latest_version.metadata,
            authors: ['David Newswanger'],
            license: 'MIT',
            homepage: 'https://www.example.com',
            documentation: 'https://www.example.com',
            issues: 'https://www.example.com',
            repository: 'https://www.example.com',
        };

        latest_version.docs_blob = {
            contents: [
                {
                    doc_strings: {},
                    readme_file: 'README.md',
                    readme_html:
                        '<h1>Factoid</h1>\n<p>A brief description of the role goes here.</p>\n<h2>Requirements</h2>\n<p>Any pre-requisites that may not be covered by Ansible itself or the role should be mentioned here. For instance, if the role uses the EC2 module, it may be a good idea to mention in this section that the boto package is required.</p>\n<h2>Role Variables</h2>\n<p>A description of the settable variables for this role should go here, including any variables that are in defaults/main.yml, vars/main.yml, and any variables that can/should be set via parameters to the role. Any variables that are read from other roles and/or the global scope (ie. hostvars, group vars, etc.) should be mentioned here as well.</p>\n<h2>Dependencies</h2>\n<p>A list of other roles hosted on Galaxy should go here, plus any details in regards to parameters that may need to be set for other roles, or variables that are used from other roles.</p>\n<h2>Example Playbook</h2>\n<p>Including an example of how to use your role (for instance, with variables passed in as parameters) is always nice for users too:</p>\n<pre><code>- hosts: servers\n  roles:\n     - { role: username.rolename, x: 42 }\n</code></pre>\n<h2>License</h2>\n<p>BSD</p>\n<h2>Author Information</h2>\n<p>An optional section for the role authors to include contact information, or a website (HTML is not allowed).</p>',
                    content_name: 'factoid',
                    content_type: 'role',
                },
                {
                    doc_strings: {},
                    readme_file: 'README.md',
                    readme_html: '<p>Role</p>',
                    content_name: 'deltoid',
                    content_type: 'role',
                },
                {
                    doc_strings: {
                        doc: {
                            author: ['David Newswanger (@newswangerd)'],
                            module: 'real_facts',
                            options: [
                                {
                                    name: 'name',
                                    default: 'Richard Stallman',
                                },
                            ],
                            filename:
                                '/tmp/tmplx7uj71c/plugins/modules/real_facts.py',
                            description: [
                                'A module that dishes out the true facts.',
                                "This is an ansible implementation of the GNU Octave 'truth' script.",
                                'https://fossies.org/linux/octave/scripts/miscellaneous/fact.m',
                            ],
                            version_added: '2.8',
                            short_description:
                                'A module that dishes out the true facts.',
                        },
                        return: [
                            {
                                name: 'fact',
                                type: 'str',
                                sample:
                                    'Richard Stallman takes notes in binary.',
                                description: 'Actual facts',
                            },
                        ],
                        examples:
                            '\n# Pass in a message\n- name: Test with a message\n  real_facts:\n    name: David Newswanger\n',
                        metadata: {
                            status: ['preview'],
                            supported_by: 'community',
                        },
                    },
                    readme_file: null,
                    readme_html: null,
                    content_name: 'real_facts',
                    content_type: 'module',
                },
            ],
            collection_readme: {
                html:
                    '<h1>How to use this Demo</h1>\n<ol>\n<li>Install the latest version of mazer: <code>pip install mazer</code>.</li>\n<li>Install or upgrade to Ansible 2.8+</li>\n<li>Download this collection from galaxy: <code>mazer install newswangerd.collection_demo</code></li>\n<li>Execute the <code>real_facts</code> module using <code>ansible localhost -m newswangerd.collection_demo.real_facts</code></li>\n</ol>\n<p>To see a recorded demo using this collection <a href="https://www.youtube.com/watch?v=d792W44I5KM">check out this video here</a>.</p>\n<h1>What is a collection?</h1>\n<p>A collection is a distribution format for delivering all types of Ansible Content.</p>\n<p>To learn more about using and creating collections, <a href="https://docs.ansible.com/ansible/devel/dev_guide/collections_tech_preview.html">check out the official documentation here</a></p>',
                name: 'README.md',
            },
            documentation_files: [
                {
                    html:
                        '<h1>Hello world</h1>\n<p>This is a test <strong>markdown</strong> file!</p>\n<ul>\n<li>Now watch me list</li>\n</ul>\n<pre><code>now watch me code\n</code></pre>\n\n<p><code>now watch me code again</code></p>\n<h2>Now with new things in version 1.0.7</h2>',
                    name: 'test_guide.md',
                },
            ],
        };

        latest_version.contents = [
            {
                name: 'factoid',
                description: null,
                content_type: 'role',
            },
            {
                name: 'deltoid',
                description: null,
                content_type: 'role',
            },
            {
                name: 'real_facts',
                description: 'A module that dishes out the true facts.',
                content_type: 'module',
            },
        ];

        return {
            ...collection,
            name: 'collection_demo',
            latest_version: latest_version,
            all_versions: [
                {
                    ...collection.latest_version,
                    created: collection.latest_version.created_at,
                },
                {
                    id: 9,
                    version: '1.0.0',
                    created: this.randDate(
                        new Date(2019, 0, 1),
                        new Date(),
                    ).toString(),
                },
            ],
        };
    }
}
