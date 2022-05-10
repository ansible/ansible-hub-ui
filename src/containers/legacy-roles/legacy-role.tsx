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
import { LegacyAPI } from 'src/api/legacy';
import { LegacyRoleAPI } from 'src/api/legacyrole';
import { LegacyRoleListType } from 'src/api';
import { LegacyRoleListItem } from 'src/components/legacy-role-list/legacy-role-item';
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
//import { filterIsSet } from 'src/utilities';
//import { Paths } from 'src/paths';

interface IProps {
  legacyroles: LegacyRoleListType[];
  //numberOfResults: number;
  itemCount: number;
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    tags?: string[];
    view_type?: string;
  };
  updateParams: (params) => void;
  ignoredParams: string[];
  //showControls?: boolean;
  //loading: boolean;
}

interface LegacyRole {
  user: string;
  name: string;
  latest_version: string;
}

//class LegacyRoles extends React.Component<RouteComponentProps, IState> {
//class LegacyRoles extends React.Component {
class LegacyRole extends React.Component<RouteComponentProps, IProps> {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      legacyroles: [],
    };
  }

  componentDidMount() {
    console.log('LegacyRoles mounted');
    console.log('LegacyRoles state', this.state);
    console.log('LegacyRoles props', this.props);
    console.log('LegacyAPI', LegacyAPI);
    console.log('LegacyRoleAPI', LegacyRoleAPI);

    LegacyRoleAPI.get('roles').then((response) => {
      console.log(response.data);
      //this.setState({legacyroles: response.data});
      this.setState((state, props) => ({
        legacyroles: response.data.results,
      }));
    });
  }

  render() {
    return (
      <div>
        <BaseHeader title={t`Legacy Roles`}></BaseHeader>
        <React.Fragment>
          <DataList aria-label={t`List of Legacy Roles`}>
            {this.state.legacyroles &&
              this.state.legacyroles.map((lrole) => (
                <LegacyRoleListItem
                  key={lrole.github_user + lrole.name + lrole.id}
                  role={lrole}
                />
              ))}
          </DataList>
        </React.Fragment>
      </div>
    );
  }
}

export default withRouter(LegacyRole);

LegacyRole.contextType = AppContext;
