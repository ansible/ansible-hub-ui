import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceDetail } from './namespace-detail';
import { namespaceBreadcrumb } from 'src/paths';

interface IProps extends RouteComponentProps {
  selectedRepo: string;
}
class PartnerDetail extends React.Component<IProps> {
  render() {
    return (
      <NamespaceDetail
        {...this.props}
        showControls={false}
        breadcrumbs={[namespaceBreadcrumb]}
      ></NamespaceDetail>
    );
  }
}

export default withRouter(PartnerDetail);
