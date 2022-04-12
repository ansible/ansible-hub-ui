import { t } from '@lingui/macro';
import * as React from 'react';
import './legacy-roles.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { DataList, Switch } from '@patternfly/react-core';
import {
  BaseHeader,
  CardListSwitcher,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Pagination,
  RepoSelector,
} from 'src/components';
//import {
//  LegacyRoleListType,
//} from 'src/api';
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
//import { filterIsSet } from 'src/utilities';
//import { Paths } from 'src/paths';


interface IState {
  //Roles: LegacyRoleListType[];
  numberOfResults: number;
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    tags?: string[];
    view_type?: string;
  };
  loading: boolean;
}


//class LegacyRoles extends React.Component<RouteComponentProps, IState> {
class LegacyRoles extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
        <div><h1>ROLES</h1></div>
    );
  }

}

export default withRouter(LegacyRoles);

LegacyRoles.contextType = AppContext;
