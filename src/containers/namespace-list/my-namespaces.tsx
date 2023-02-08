import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Paths } from 'src/paths';
import { NamespaceList } from './namespace-list';

class MyNamespaces extends React.Component<RouteComponentProps, {}> {
  render() {
    return (
      <NamespaceList
        {...this.props}
        namespacePath={Paths.myCollectionsByRepo}
        title='My namespaces'
        filterOwner={true}
      />
    );
  }
}

export default withRouter(MyNamespaces);
