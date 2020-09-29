import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceList } from './namespace-list';
import { Paths } from '../../paths';

class Partners extends React.Component<RouteComponentProps, {}> {
  render() {
    var name = NAMESPACE_TERM.charAt(0).toUpperCase() + NAMESPACE_TERM.slice(1);

    return (
      <NamespaceList
        {...this.props}
        namespacePath={Paths.namespaceByRepo}
        title={name}
      />
    );
  }
}

export default withRouter(Partners);
