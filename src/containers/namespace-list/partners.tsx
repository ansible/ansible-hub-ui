import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Paths } from 'src/paths';
import { NamespaceList } from './namespace-list';

class Partners extends React.Component<RouteComponentProps> {
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
