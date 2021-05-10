import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceList } from './namespace-list';
import { namespaceBreadcrumb, Paths } from 'src/paths';

class Partners extends React.Component<RouteComponentProps, {}> {
  render() {
    return (
      <NamespaceList
        {...this.props}
        namespacePath={Paths.namespaceByRepo}
        title={namespaceBreadcrumb.name}
      />
    );
  }
}

export default withRouter(Partners);
