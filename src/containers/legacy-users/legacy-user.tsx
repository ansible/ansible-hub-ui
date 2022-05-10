import { t } from '@lingui/macro';
import * as React from 'react';
import './legacy-users.scss';

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
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';

interface LURProps {
  user: LegacyUserListType;
  //roles: LegacyRoleListType[]
}

interface LURState {
  user: LegacyUserListType;
  roles: LegacyRoleListType[]
}

// class App extends React.Component<{}, { value: string }> {
//class LegacyUserRoles extends React.Component<LURProps> {
class LegacyUserRoles extends React.Component<LURProps, LURState> {
  constructor(props) {
    super(props);
    console.log('legacy user role props', props);
    this.state = {
      //...props,
      user: props.user,
      roles: null,
    };
    console.log('init state', this.state);
  }

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
            }
        });
      });
  };

  render() {
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

        };
    }

    return(<DataListItemCells dataListCells={infocells} />);
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
    const userid = props.match.params.userid
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
        return (<div>loading</div>);
    }

    const infocells = [];
    //const rolecells = [];

    if (this.state.user !== undefined) {
        infocells.push(
          <DataListCell isFilled={false} alignRight={false} key='ns'>
            <BaseHeader title={this.state.user.username}></BaseHeader>
          </DataListCell>,
        );

        infocells.push(
          <DataListCell isFilled={false} alignRight={false} key='ns'>
            <Logo
              alt={t`role.github_user logo`}
              fallbackToDefault
              image='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
              size='90px'
              unlockWidth
              width='90px'
            ></Logo>
          </DataListCell>,
        );

        infocells.push(
          <DataListCell isFilled={false} alignRight={false} key='ns'>
            <TextContent>
              <Text component={TextVariants.small}>
                <h2>{this.state.user.username}</h2>
              </Text>
            </TextContent>
          </DataListCell>,
        );
    };

    return (
      <DataListItem data-cy='LegacyUser'>
        <DataListItemRow>
          <DataListItemCells dataListCells={infocells} />
        </DataListItemRow>
        <DataListItemRow>
            <LegacyUserRoles user={this.state.user} />
        </DataListItemRow>
     </DataListItem>
    );

  }

}

export default withRouter(LegacyUser);

LegacyUser.contextType = AppContext;
