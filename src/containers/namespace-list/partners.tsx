import * as React from 'react';
import { Paths } from 'src/paths';
import { RouteProps, withRouter } from 'src/utilities';
import { NamespaceList } from './namespace-list';

class Partners extends React.Component<RouteProps> {
  render() {
    return (
      <NamespaceList
        {...this.props}
        namespacePath={Paths.namespaceDetail}
        filterOwner={false}
      />
    );
  }
}

export default withRouter(Partners);
