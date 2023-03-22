import * as React from 'react';
import { EmptyStateUnauthorized } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths } from 'src/paths';
import { RouteProps, withRouter } from 'src/utilities';
import { NamespaceList } from './namespace-list';

class MyNamespaces extends React.Component<RouteProps> {
  render() {
    if (!this.context.user || this.context.user.is_anonymous) {
      return <EmptyStateUnauthorized />;
    }
    return (
      <NamespaceList
        {...this.props}
        namespacePath={Paths.namespaceDetail}
        filterOwner={true}
      />
    );
  }
}

export default withRouter(MyNamespaces);
MyNamespaces.contextType = AppContext;
