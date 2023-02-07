import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { EmptyStateUnauthorized } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths } from 'src/paths';
import { NamespaceList } from './namespace-list';

class MyNamespaces extends React.Component<RouteComponentProps> {
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
