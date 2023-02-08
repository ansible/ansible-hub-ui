import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Paths } from 'src/paths';
import { NamespaceDetail } from './namespace-detail';

interface IProps extends RouteComponentProps {
  selectedRepo: string;
}

class ManageNamespace extends React.Component<IProps> {
  render() {
    return (
      <NamespaceDetail
        {...this.props}
        showControls={true}
        breadcrumbs={[{ url: Paths.myNamespaces, name: 'My namespaces' }]}
      ></NamespaceDetail>
    );
  }
}

export default withRouter(ManageNamespace);
