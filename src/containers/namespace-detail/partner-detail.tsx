import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceDetail } from './namespace-detail';
import { Paths } from '../../paths';

interface IProps extends RouteComponentProps {
  selectedRepo: string;
}
class PartnerDetail extends React.Component<IProps> {
  render() {
    var name = NAMESPACE_TERM.charAt(0).toUpperCase() + NAMESPACE_TERM.slice(1);

    return (
      <NamespaceDetail
        {...this.props}
        showControls={false}
        breadcrumbs={[{ url: Paths[NAMESPACE_TERM], name: name }]}
      ></NamespaceDetail>
    );
  }
}

export default withRouter(PartnerDetail);
