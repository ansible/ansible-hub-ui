import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NamespaceList } from './namespace-list';
import { Paths } from '../../paths';
import { Constants } from '../../constants';

class Partners extends React.Component<RouteComponentProps, {}> {
  render() {
    const path =
      DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
        ? Paths.myCollections
        : Paths.myCollectionsByRepo;
    return (
      <NamespaceList {...this.props} namespacePath={path} title='Partners' />
    );
  }
}

export default withRouter(Partners);
