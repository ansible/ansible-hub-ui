import * as React from 'react';
import { RouteProps, withRouter } from 'src/utilities';

import { NamespaceList } from './namespace-list';
import { Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { EmptyStateUnauthorized } from 'src/components';

class MyNamespaces extends React.Component<RouteProps> {
  render() {
    if (!this.context.user || this.context.user.is_anonymous) {
      return <EmptyStateUnauthorized />;
    }
    return (
      <NamespaceList
        {...this.props}
        namespacePath={Paths.myCollectionsByRepo}
        filterOwner={true}
      />
    );
  }
}

export default withRouter(MyNamespaces);
MyNamespaces.contextType = AppContext;
