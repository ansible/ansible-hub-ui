import React, { Component } from 'react';
import { RouteProps, withRouter } from 'src/utilities';
import { NamespaceList } from './namespace-list';

class Partners extends Component<RouteProps> {
  render() {
    return <NamespaceList {...this.props} />;
  }
}

export default withRouter(Partners);
