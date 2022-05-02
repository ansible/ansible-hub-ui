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
import {
  LegacyRoleListType,
} from 'src/api';
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
//import { filterIsSet } from 'src/utilities';
//import { Paths } from 'src/paths';

interface IState {
  legacyroles: LegacyRoleListType[];
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
//class LegacyRoles extends React.Component {
class LegacyRoles extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('LegacyRoles mounted');
    console.log('LegacyRoles state', this.state);
    console.log('LegacyRoles props', this.props);
  } 

  render() {
    const legacyroles = ['foo.bar', 'foo.baz', 'jim.bob'];
    return (
      <div>
        <h1>ROLES</h1>
        {legacyroles.map((r) => (
            <div id={r} key={r}>ROLE: {r}</div>
        ))}
      </div>
    );
  }
}

export default withRouter(LegacyRoles);

LegacyRoles.contextType = AppContext;
