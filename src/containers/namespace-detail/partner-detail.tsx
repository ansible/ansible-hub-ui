import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceDetail } from './namespace-detail';

class PartnerDetail extends React.Component<RouteComponentProps> {
    render() {
        return (
            <NamespaceDetail
                {...this.props}
                showControls={false}
            ></NamespaceDetail>
        );
    }
}

export default withRouter(PartnerDetail);
