import * as MockAdapter from 'axios-mock-adapter';
import { CollectionListType } from '../../api';
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
                created: this.randDate(
                    new Date(2016, 0, 1),
                    new Date(),
                ).toString(),
                metadata: {
                    description: this.lipsum.substring(
                        0,
                        this.randNum(this.lipsum.length),
                    ),
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
}
