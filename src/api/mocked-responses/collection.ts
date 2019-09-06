import * as MockAdapter from 'axios-mock-adapter';
import { CollectionListType, CollectionDetailType } from '../../api';
import { redHat } from './namespace';
import { RandomGenerator } from './generator';

export class MockCollection {
    mock: any;
    collectionNames = [
        'epel',
        'collection_demo',
        'a_collection_with_a_really_annoying_long_name',
        'community',
        'kitchen_sink',
        'bathroom_sink',
        'outdoor_sink',
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
            .onGet(apiPath + 'red_hat/epel/')
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
            description: this.lipsum.substring(
                0,
                this.randNum(this.lipsum.length),
            ),
            latest_version: {
                id: id,
                version: `${this.randNum(5)}.${this.randNum(10)}.${this.randNum(
                    100,
                )}`,
                created: this.randDate(
                    new Date(2016, 0, 1),
                    new Date(),
                ).toString(),
                metadata: {
                    tags: this.randWords(9),
                },
            },
            content_summary: {
                total_count: this.randNum(20),
                contents: {
                    module: this.randWords(9999),
                    role: this.randWords(999),
                    plugin: this.randWords(99),
                    playbook: this.randWords(9),
                },
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
            collection_readme: {
                filename: 'README.md',
                html:
                    '<h1>What is a collection?</h1>\n<p>To see a walkthrough using this collection <a href="https://www.youtube.com/watch?v=d792W44I5KM">check out this video here</a>.</p>\n<p>A collection is a distribution format for delivering all types of Ansible Content.</p>\n<p>The standard format for a collection looks something like this:</p>\n<pre><code>demo/\n\u251c\u2500\u2500 README.md\n\u251c\u2500\u2500 galaxy.yml\n\u251c\u2500\u2500 plugins\n\u2502\u00a0\u00a0 \u2514\u2500\u2500 modules\n\u2502\u00a0\u00a0     \u2514\u2500\u2500 real_facts.py\n\u2514\u2500\u2500 roles\n    \u2514\u2500\u2500 factoid\n        \u251c\u2500\u2500 README.md\n        \u251c\u2500\u2500 meta\n        \u2502\u00a0\u00a0 \u2514\u2500\u2500 main.yaml\n        \u2514\u2500\u2500 tasks\n            \u2514\u2500\u2500 main.yml\n</code></pre>\n\n<p>It includes a <code>galaxy.yml</code> file for defining the collections name, version, tags, license and other meta data as well as\ndirectories for roles and plugins. The roles directory contains a list of traditional roles and the plugins directory can\ncontain subdirectories for all of the Ansible plugin types such as modules, inventory, callback, connection plugins and more.</p>\n<h1>How do I build a collection?</h1>\n<p>Collections are currently built using <a href="https://github.com/ansible/mazer/">mazer</a>. To build this collection:</p>\n<pre><code>$ cd demo\n$ mazer build\n</code></pre>\n\n<p>This will create a releases directory with tarballs of each release. These tarballs can be uploaded and distributed\nthrough galaxy.</p>\n<pre><code>\u251c\u2500\u2500 releases\n\u2502\u00a0\u00a0 \u2514\u2500\u2500 newswangerd-demo-1.0.1.tar.gz\n</code></pre>\n\n<h1>How do I use a collection?</h1>\n<p>Collections are stored in <code>~/.ansible/collections/ansible_collections</code>. You can either place a collection here\nmanually or you can use <code>mazer install namespace.collection_name</code> to download an existing collection from Galaxy\nand have it install automatically.</p>\n<p>Collections in playbooks can be used like so:</p>\n<pre><code>################################################################################\n- name: Run a module from inside a collection\n  hosts: localhost\n  tasks:\n    - name: Gather some real Facts.\n      newswangerd.demo.real_facts:\n        name: Richard Stallman\n      register: testout\n    - debug:\n        msg: &quot;{{ testout }}&quot;\n\n################################################################################\n- name: Run a module from inside a collection using the collections keyword\n  hosts: localhost\n  collections:\n    - newswangerd.demo\n  tasks:\n    - name: Gather some real Facts.\n      real_facts:\n        name: Richard Stallman\n      register: testout\n    - debug:\n        msg: &quot;{{ testout }}&quot;\n\n################################################################################\n- name: Run a role from inside of a collection\n  hosts: localhost\n  roles:\n    - &quot;newswangerd.demo.factoid&quot;\n</code></pre>',
            },
            documentation_files: [
                {
                    filename: 'beginners_guide.md',
                    html: '<h1>Beginners Guide</h1>',
                },
                {
                    filename: 'advanced_guide.md',
                    html: '<h1>Advanced Guide</h1>',
                },
            ],
            contents: [
                {
                    content_name: 'factoid',
                    content_type: 'role',
                    doc_strings: {},
                    readme_file: 'README.md',
                    readme_html: '<h1>Factoid</h1><p> I AM A README! </p>',
                },
                {
                    content_name: 'real_facts',
                    content_type: 'module',
                    doc_strings: {
                        doc: {
                            author: ['David Newswanger (@newswangerd)'],
                            description: [
                                'A module that dishes out the true facts.',
                                "This is an ansible implementation of the GNU Octave 'truth' script.",
                                'https://fossies.org/linux/octave/scripts/miscellaneous/fact.m',
                            ],
                            filename:
                                '/private/var/folders/t1/3frxjpn103bch37c27pjp76c0000gn/T/tmp4apigh_i/plugins/modules/real_facts.py',
                            module: 'real_facts',
                            options: [
                                {
                                    name: 'name',
                                    default: 'Richard Stallman',
                                    description: [
                                        'This is the message to send to the sample module',
                                    ],
                                },
                            ],
                            short_description:
                                'A module that dishes out the true facts.',
                            version_added: '2.8',
                        },
                        metadata: {
                            status: ['preview'],
                            supported_by: 'community',
                        },
                        examples:
                            '# Pass in a message\n- name: Test with a message\n  real_facts:\n    name: David Newswanger\n',
                        return: [
                            {
                                name: 'fact',
                                description: 'Actual facts',
                                return: 'success',
                                type: 'str',
                                sample:
                                    "Richard Stallman doesn't need to buy a bigger hard drive. He can compress data infinitely.",
                            },
                        ],
                    },
                    readme_file: null,
                    readme_html: null,
                },
            ],
        };

        latest_version.contents = [
            {
                name: 'factoid',
                content_type: 'role',
                description: null,
            },
            {
                name: 'real_facts',
                content_type: 'module',
                description: 'A module that dishes out the true facts.',
            },
        ];

        return {
            ...collection,
            latest_version: latest_version,
            all_versions: [
                {
                    ...collection.latest_version,
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
