import * as MockAdapter from 'axios-mock-adapter';
import {
    ImportListType,
    ImportDetailType,
    PulpStatus,
    ImportMessageCodes,
} from '../../api';
import { RandomGenerator } from './generator';

export class MockImport {
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

    imports: ImportListType[];
    importMesages: any[];
    importDetail: any;

    constructor(http: any, apiPath: string) {
        this.imports = this.getImportList();
        this.importMesages = [];
        this.importDetail = this.getImportDetail();

        this.mock = new MockAdapter(http, { delayResponse: 200 });
        this.mock.onGet(`${apiPath}0/`).reply(200, this.importDetail);
        this.mock.onGet(apiPath).reply(200, {
            data: this.imports,
            links: {},
            meta: { count: this.imports.length },
        });
    }

    getImportList() {
        const imports = [] as ImportListType[];

        for (let i = 0; i < this.collectionNames.length; i++) {
            imports.push(ImportGenerator.generate(i, this.collectionNames[i]));
        }

        return imports;
    }

    getImportDetail() {
        // Mutate the list of messages so that new messages get added each
        // time this is called
        for (let m of TaskGenerator.generate()) {
            this.importMesages.push(m);
        }

        return {
            ...this.imports[0],
            job_id: '1',
            error: {
                code: 'dun-goofed',
                description: 'ya dun goofed',
                traceback: 'omg you reeally really dun goofed',
            },
            imported_version: this.imports[0].version,
            messages: this.importMesages,
        };
    }
}

class TaskGenerator extends RandomGenerator {
    static generate(): any[] {
        const l = [];

        for (let i = 0; i < this.randNum(20); i++) {
            l.push({
                level: this.randNum(2) < 1 ? '' : ImportMessageCodes.error,
                message: this.randString(40),
                time: new Date().toString(),
            });
        }

        l.push({
            level: ImportMessageCodes.success,
            time: new Date().toString(),
            message: '',
        });

        return l;
    }
}

class ImportGenerator extends RandomGenerator {
    static generate(id, name): ImportListType {
        return {
            id: id,
            state: id === 0 ? PulpStatus.running : PulpStatus.completed,
            started_at: this.randDate(
                new Date(2019, 0, 1),
                new Date(),
            ).toString(),
            finished_at: this.randDate(
                new Date(2019, 0, 1),
                new Date(),
            ).toString(),
            namespace: {
                id: 1,
                name: 'red_hat',
            },
            name: name,
            version: `${this.randNum(5)}.${this.randNum(10)}.${this.randNum(
                100,
            )}`,
        };
    }
}
