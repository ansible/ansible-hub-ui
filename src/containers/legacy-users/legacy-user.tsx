import { t } from '@lingui/macro';
import * as React from 'react';
import './legacy-users.scss';

import { Link } from 'react-router-dom';

import {
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  LabelGroup,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import {
  NumericLabel,
  Tag,
  Logo,
  DeprecatedTag,
  DateComponent,
} from 'src/components';

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
import { LegacyUserAPI } from 'src/api/legacyuser';
import { LegacyUserListType } from 'src/api';
import { LegacyUserListItem } from 'src/components/legacy-user-list/legacy-user-item';
import { LegacyRoleListType } from 'src/api';
import { LegacyRoleListItem } from 'src/components/legacy-role-list/legacy-role-item';
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';

interface LURProps {
  user: LegacyUserListType;
  //roles: LegacyRoleListType[]
}

interface LURState {
  mounted: boolean;
  count: number;
  user: LegacyUserListType;
  roles: LegacyRoleListType[];
  params: {
    page?: number;
    page_size?: number;
    order_by?: string;
    keywords?: string;
    tags?: string[];
    view_type?: string;
  };
}

// class App extends React.Component<{}, { value: string }> {
//class LegacyUserRoles extends React.Component<LURProps> {
class LegacyUserRoles extends React.Component<LURProps, LURState> {
  constructor(props) {
    super(props);
    console.log('legacy user role props', props);
    this.state = {
      //...props,
      mounted: false,
      count: 0,
      user: props.user,
      roles: null,
      params: {
        page: 1,
        page_size: 10,
        order_by: 'created',
      },

    };
    console.log('init state', this.state);
  }

  /*
  componentDidMount() {
    const user = this.state.user;
    const url = 'roles/?namespace=' + user.id;
    console.log('fetching url', url);
    LegacyRoleAPI.get_raw(url).then((response) => {
      console.log(response.data);
      this.setState((state, props) => {
        return {
          user: user,
          roles: response.data.results,
        };
      });
    });
  }
  */

  componentDidMount() {

    const user = this.state.user;

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

    const url = `roles/?namespace=${user.id}&page=${page_num}&page_size=${page_size}&order_by=${order_by}`;
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
        user: user,
        roles: response.data.results,
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
    const user = this.state.user;

    const url = `roles/?namespace=${user.id}&page=${page}&page_size=${page_size}&order_by=${order_by}`;
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
        user: user,
        roles: response.data.results,
      }));
    });

  }

  render() {
    /*
    console.log(this.state);

    const infocells = [];
    if (this.state.roles !== undefined && this.state.roles !== null) {
      for (var i = 0; i < this.state.roles.length; i++) {
        const thisRole = this.state.roles[i];
        console.log('ROLE', thisRole);

        infocells.push(
          <DataListCell isFilled={false} alignRight={false} key='ns'>
            <BaseHeader title={thisRole.name}></BaseHeader>
          </DataListCell>,
        );
      }
    }

    return <DataListItemCells dataListCells={infocells} />;
    */

    return (
     <div>
        {/*<BaseHeader title={t`Legacy Roles`}></BaseHeader>*/}
        <React.Fragment>
          { this.state.mounted && 
              <DataList aria-label={t`List of Legacy Roles`}>
                {this.state.roles &&
                  this.state.roles.map((lrole) => (
                    <LegacyRoleListItem
                      key={lrole.github_user + lrole.name + lrole.id}
                      role={lrole}
                      show_thumbnail={false}
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
     )
  }
}

interface IProps {
  userid: number;
  user: LegacyUserListType;
  //roles: LegacyRoleListType[]
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

class LegacyUser extends React.Component<RouteComponentProps, IProps> {
  constructor(props) {
    super(props);
    console.log('user props', props);
    const userid = props.match.params.userid;
    this.state = {
      ...props,
      userid: userid,
      user: null,
      roles: null,
    };
    console.log(this.state);
  }

  componentDidMount() {
    LegacyUserAPI.get('users/' + this.state.userid).then((response) => {
      // set the user
      console.log(response.data);
      const user = response.data;

      this.setState((state, props) => ({
        user: response.data,
      }));
    });

  }

  render() {
    if (this.state.user === null) {
      return <div>loading</div>;
    }

    const infocells = [];
    //const rolecells = [];

    if (this.state.user !== undefined) {
      /*
      infocells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns'>
          <BaseHeader title={this.state.user.username}></BaseHeader>
        </DataListCell>,
      );
      */

      //image='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
      infocells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns'>
          <Logo
            alt='avatar url'
            fallbackToDefault
            image={this.state.user.avatar_url}
            size='90px'
            unlockWidth
            width='90px'
          ></Logo>
          <Link to=''>{this.state.user.username}</Link>
        </DataListCell>,
      );

      infocells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns'>
          <BaseHeader title={this.state.user.username}></BaseHeader>
        </DataListCell>,
      );

      /*
      infocells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns'>
          <TextContent>
            <Text component={TextVariants.small}>
              <h2>{this.state.user.username}</h2>
            </Text>
          </TextContent>
        </DataListCell>,
      );
      */
    }

    return (
      <React.Fragment>
        <DataList aria-label={t`User Header`}>
          <DataListItem data-cy='LegacyUser'>
            <DataListItemRow>
              <DataListItemCells dataListCells={infocells} />
            </DataListItemRow>
          </DataListItem>
        </DataList>

        <DataList aria-label={t`Role List`}>
          <DataListItem data-cy='LegacyUser'>
            <DataListItemRow>
              <LegacyUserRoles user={this.state.user} />
            </DataListItemRow>
          </DataListItem>
        </DataList>
      </React.Fragment>
    );
  }
}

export default withRouter(LegacyUser);

LegacyUser.contextType = AppContext;
