import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceDetail } from './namespace-detail';
import { Paths } from '../../paths';

class PartnerDetail extends React.Component<RouteComponentProps> {
    render() {
        return (
            <NamespaceDetail
                {...this.props}
                showControls={false}
                breadcrumbs={[{ url: Paths.partners, name: 'Partners' }]}
            ></NamespaceDetail>
        );
    }
}

export default withRouter(PartnerDetail);
