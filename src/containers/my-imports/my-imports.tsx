import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import { Button } from '@patternfly/react-core';

import { BaseHeader, NotImplemented, ImportConsole } from '../../components';
import { ImportAPI, ImportDetailType, ImportListType } from '../../api';

interface IState {
    importDetail: ImportDetailType;
    importList: ImportListType[];
}

class MyImports extends React.Component<RouteComponentProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            importDetail: undefined,
            importList: [],
        };
    }

    componentDidMount() {
        Promise.all([ImportAPI.get('0'), ImportAPI.list()]).then(val => {
            this.setState({
                importDetail: val[0].data,
                importList: val[1].data.data,
            });
        });
    }

    render() {
        // ImportAPI.list().then(result => console.log(result));
        const { importDetail, importList } = this.state;

        if (!importDetail) {
            return null;
        }

        return (
            <React.Fragment>
                <BaseHeader title='My Imports' />
                <Main>
                    <Section className='body'>
                        <ImportConsole
                            task={importDetail}
                            selectedImport={importList[0]}
                            followMessages={false}
                            noImportsExist={false}
                            setFollowMessages={x => console.log(x)}
                        />
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(MyImports);
