import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceDetail } from './namespace-detail';
import { Paths } from 'src/paths';

interface IProps extends RouteComponentProps {
  selectedRepo: string;
}
class PartnerDetail extends React.Component<IProps> {
  render() {
    return (
      <NamespaceDetail
        {...this.props}
        showControls={false}
        breadcrumbs={[{ url: Paths.namespaces, name: 'Namespaces' }]}
      ></NamespaceDetail>
    );
  }
}

export default withRouter(PartnerDetail);
