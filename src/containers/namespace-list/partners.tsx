import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceList } from './namespace-list';
import { Paths } from '../../paths';
import { Constants } from '../../constants';

class Partners extends React.Component<RouteComponentProps, {}> {
  render() {
    return (
      <NamespaceList
        {...this.props}
        namespacePath={Paths.myCollectionsByRepo}
        title='Partners'
      />
    );
  }
}

export default withRouter(Partners);
