import { t } from '@lingui/macro';
import * as React from 'react';
import './legacy-users.scss';

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
import { LegacyUserAPI } from 'src/api/legacyuser';
import { LegacyUserListType } from 'src/api';
import { LegacyUserListItem } from 'src/components/legacy-user-list/legacy-user-item';
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
//import { filterIsSet } from 'src/utilities';
//import { Paths } from 'src/paths';

interface IProps {
  legacyusers: LegacyUserListType[];
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

class LegacyUsers extends React.Component<RouteComponentProps, IProps> {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      legacyusers: [],
    };
  }

  componentDidMount() {
    LegacyUserAPI.get('users').then((response) => {
      console.log(response.data);
      //this.setState({legacyroles: response.data});
      this.setState((state, props) => ({
        legacyusers: response.data.results,
      }));
    });
  }

  render() {
    return (
      <div>
        <BaseHeader title={t`Legacy Users`}></BaseHeader>
        <React.Fragment>
          <DataList aria-label={t`List of Legacy Users`}>
            {this.state.legacyusers &&
              this.state.legacyusers.map((luser) => (
                <LegacyUserListItem key={luser.id} user={luser} />
              ))}
          </DataList>
        </React.Fragment>
      </div>
    );
  }
}

export default withRouter(LegacyUsers);

LegacyUsers.contextType = AppContext;
