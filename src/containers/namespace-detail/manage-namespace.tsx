import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceDetail } from './namespace-detail';

class ManageNamespace extends React.Component<RouteComponentProps> {
    render() {
        return (
            <NamespaceDetail
                {...this.props}
                showControls={true}
            ></NamespaceDetail>
        );
    }
}

export default withRouter(ManageNamespace);
