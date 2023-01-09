import * as React from 'react';
import { RouteProps, withRouter } from 'src/utilities';

import { NamespaceList } from './namespace-list';
import { Paths } from 'src/paths';

class Partners extends React.Component<RouteProps> {
  render() {
    return (
      <NamespaceList
        {...this.props}
        namespacePath={Paths.namespaceByRepo}
        filterOwner={false}
      />
    );
  }
}

export default withRouter(Partners);
