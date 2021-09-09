import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceList } from './namespace-list';
import { Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { EmptyStateUnauthorized } from 'src/components';

class MyNamespaces extends React.Component<RouteComponentProps, {}> {
  render() {
    if (!this.context.user || this.context.user.is_guest) {
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
