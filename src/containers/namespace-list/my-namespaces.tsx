import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceList } from './namespace-list';
import { Paths } from '../../paths';

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
