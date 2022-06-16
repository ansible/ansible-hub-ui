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
  mounted: boolean;
  count: number;
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    tags?: string[];
    view_type?: string;
    order_by?: string;
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
class LegacyRoles extends React.Component<RouteComponentProps, IProps> {
 
  constructor(props) {
    console.log('constructor', 'props', props);
    super(props);
    //this.props = props;
    this.state = {
      ...props,
      params: {
        page: 1,
        page_size: 10,
        order_by: 'created'
      },
      mounted: false,
      count: 0,
      legacyroles: [],
    };
    console.log('constructor', 'state', this.state);
  }

  componentDidMount() {
    console.log('LegacyRoles mounted');
    console.log('LegacyRoles state', this.state);
    console.log('LegacyRoles props', this.props);
    console.log('LegacyAPI', LegacyAPI);
    console.log('LegacyRoleAPI', LegacyRoleAPI);

    const thisPath = window.location.pathname;
    console.log("thisPath", thisPath);
    const thisHref = window.location.href;
    console.log("thisHref", thisHref);
    const thisQS = window.location.search;
    console.log('thisQS', thisQS);
    const urlParams = new URLSearchParams(thisQS);
    console.log('urlParams', urlParams);
    let page_num = parseInt(urlParams.get('page')) || 1;
    console.log('page_num', page_num);
    let page_size = parseInt(urlParams.get('page_size')) || 10;
    console.log('page_size', page_size);
    let order_by = urlParams.get('order_by') || 'created';
    console.log('order_by', order_by);

    const url = `roles/?page=${page_num}&page_size=${page_size}&order_by=${order_by}`;
    LegacyRoleAPI.get(url).then((response) => {
      console.log(response.data);
      //this.setState({legacyroles: response.data});
      this.setState((state, props) => ({
        mounted: true,
        params: {
            page: page_num,
            page_size: page_size,
            order_by: order_by,
        },
        count: response.data.count,
        legacyroles: response.data.results,
      }));

      console.log('didmount', 'state', this.state);
    });


  }

  updateParams = (p) => {
    console.log('updateParams', p);
    const {
        page,
        page_size,
        order_by
    } = p;

    const url = `roles/?page=${page}&page_size=${page_size}&order_by=${order_by}`;
    LegacyRoleAPI.get(url).then((response) => {
      console.log(response.data);
      //this.setState({legacyroles: response.data});
      this.setState((state, props) => ({
        mounted: true,
        params: {
            page: page,
            page_size: page_size,
            order_by: order_by,
        },
        count: response.data.count,
        legacyroles: response.data.results,
      }));
    });

  }

  render() {
    console.log('LEGACY ROLES 2 RENDER');

    /*
    const {
      legacyroles,
      params,
      updateParams,
      //ignoredParams,
      //itemCount,
      //showControls,
    } = this.props;
    */

    /*
    const pageParams = {
        count: this.state.count,
        page: this.state.params.page,
        page_size: this.state.params.page_size,
    }
   */

    console.log('render', 'props', this.props);

    return (
      <div>
        <BaseHeader title={t`Legacy Roles`}></BaseHeader>
        <React.Fragment>
          { this.state.mounted && 
              <DataList aria-label={t`List of Legacy Roles`}>
                {this.state.legacyroles &&
                  this.state.legacyroles.map((lrole) => (
                    <LegacyRoleListItem
                      key={lrole.github_user + lrole.name + lrole.id}
                      role={lrole}
                    />
                  ))}
              </DataList>
          }
          { this.state.mounted && 
              <Pagination
                params={this.state.params}
                //updateParams={(p) => this.updateParams(p)}
                updateParams={this.updateParams}
                count={this.state.count}
              />
          }
        </React.Fragment>
      </div>
    );
  }
}

export default withRouter(LegacyRoles);

LegacyRoles.contextType = AppContext;
