import React from 'react';
import { RouteProps, withRouter } from 'src/utilities';
import { NamespaceList } from './namespace-list';

class Partners extends React.Component<RouteProps> {
  render() {
    return <NamespaceList {...this.props} filterOwner={false} />;
  }
}

export default withRouter(Partners);
