import React, { Component } from 'react';
import { EmptyStateUnauthorized } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { RouteProps, withRouter } from 'src/utilities';
import { NamespaceList } from './namespace-list';

class MyNamespaces extends Component<RouteProps> {
  static contextType = AppContext;

  render() {
    if (!this.context.user || this.context.user.is_anonymous) {
      return <EmptyStateUnauthorized />;
    }

    return <NamespaceList {...this.props} filterOwner />;
  }
}

export default withRouter(MyNamespaces);
