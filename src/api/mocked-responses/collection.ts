import * as MockAdapter from 'axios-mock-adapter';
import { CollectionList } from '../response-types/collection';
import { redHat } from './namespace';

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
        const collections = [] as CollectionList[];

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

class CollectionGenerator {
    static lipsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget nisl quis diam lacinia pretium. Donec pharetra varius erat in condimentum. Maecenas sed tortor fringilla, congue lectus sit amet, ultricies urna. Nam sodales mi quis lacus condimentum, id semper nunc ultrices. In sem orci, condimentum eu magna quis, faucibus ultricies metus. Nullam justo dolor, convallis sed lacinia eget, semper ac massa. Curabitur turpis metus, auctor sed tellus et, dictum aliquam velit.`;

    static words = [
        'believer',
        'twice',
        'harquebusier',
        'southbridge',
        'secularity',
        'incubated',
        'concussive',
        'horologic',
        'intermean',
        'nonprinting',
        'polemic',
        'warta',
        'ventriculogram',
        'mispublished',
        'salmonellae',
        'rammishness',
        'baber',
        'promonarchist',
        'clausula',
    ];

    static randNum(max) {
        return Math.floor(Math.random() * max);
    }

    static randomDate(start, end) {
        return new Date(
            start.getTime() + Math.random() * (end.getTime() - start.getTime()),
        );
    }

    static randWords(length) {
        const w: string[] = [];

        for (let i = 0; i < this.randNum(length); i++) {
            w.push(this.words[this.randNum(this.words.length)]);
        }

        return w;
    }

    static generate(id, name, namespace): CollectionList {
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
                created: this.randomDate(
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
                content_summary: {
                    total_count: this.randNum(20),
                    contents: {
                        module: this.randWords(10),
                        role: this.randWords(10),
                        plugin: this.randWords(10),
                        playbook: this.randWords(10),
                    },
                },
            },
        } as CollectionList;

        return collection;
    }
}
