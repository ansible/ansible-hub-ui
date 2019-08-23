// (window as any).insights.chrome.auth
//     .getUser()
//     .then(x => console.log(x));

import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import { ClipboardCopy } from '@patternfly/react-core';

import { BaseHeader } from '../../components';

interface IState {
    data: any;
}

class TokenPage extends React.Component<RouteComponentProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            data: undefined,
        };
    }

    componentDidMount() {
        (window as any).insights.chrome.auth
            .getOfflineToken()
            .then(result => {
                this.setState({ data: result.data });
                // console.log(result);
            })
            .catch(x => {
                (window as any).insights.chrome.auth
                    .doOffline()
                    .then(x => console.log(x));
            });
    }

    render() {
        const { data } = this.state;

        if (!data) {
            return null;
        }

        return (
            <React.Fragment>
                <BaseHeader title='Your Offline Tokens'></BaseHeader>
                <Main>
                    <Section className='body'>
                        Access token - allows the user to authenticate for a
                        certain amount of time (I think)
                        <ClipboardCopy isReadOnly>
                            {data.access_token}
                        </ClipboardCopy>
                        <br />
                        Refresh Token - allows the user to get new
                        authentication token. Lasts a lot longer
                        <ClipboardCopy isReadOnly>
                            {data.refresh_token}
                        </ClipboardCopy>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(TokenPage);
