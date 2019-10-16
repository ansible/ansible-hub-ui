import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceDetail } from './namespace-detail';
import { Paths } from '../../paths';

class ManageNamespace extends React.Component<RouteComponentProps> {
    render() {
        return (
            <NamespaceDetail
                {...this.props}
                showControls={true}
                breadcrumbs={[
                    { url: Paths.myNamespaces, name: 'My namespaces' },
                ]}
            ></NamespaceDetail>
        );
    }
}

export default withRouter(ManageNamespace);
