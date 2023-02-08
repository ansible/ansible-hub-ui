import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Paths } from 'src/paths';
import { NamespaceDetail } from './namespace-detail';

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
