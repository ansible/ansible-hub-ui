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
  mounted: boolean;
  count: number;
  params: {
    page?: number;
    page_size?: number;
    order_by?: string;
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
      params: {
        page: 1,
        page_size: 10,
        order_by: 'name'
      },
      mounted: false,
      count: 0,
      legacyusers: [],
    };
  }

  componentDidMount() {

    const thisPath = window.location.pathname;
    console.log("thisPath", thisPath);
    const thisHref = window.location.href;
    console.log("thisHref", thisHref);
    const thisQS = window.location.search;
    console.log('thisQS', thisQS);
    const urlParams = new URLSearchParams(thisQS);
    console.log('urlParams', urlParams);
    let page = parseInt(urlParams.get('page')) || 1;
    console.log('page', page);
    let page_size = parseInt(urlParams.get('page_size')) || 10;
    console.log('page_size', page_size);
    let order_by = urlParams.get('order_by') || 'name';
    console.log('order_by', order_by);

    LegacyUserAPI.get('users').then((response) => {
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
        legacyusers: response.data.results,
      }));
    });
  }

  updateParams = (p) => {
    console.log('updateParams', p);
    const {
        page,
        page_size,
        order_by
    } = p;

    const url = `users/?page=${page}&page_size=${page_size}&order_by=${order_by}`;
    LegacyUserAPI.get(url).then((response) => {
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
        legacyusers: response.data.results,
      }));
    });

  }

  render() {
    return (
      <div>
        <BaseHeader title={t`Legacy Authors`}></BaseHeader>
        <React.Fragment>
          { this.state.mounted && 
              <DataList aria-label={t`List of Legacy Authors`}>
                {this.state.legacyusers &&
                  this.state.legacyusers.map((luser) => (
                    <LegacyUserListItem key={luser.id} user={luser} />
                  ))}
              </DataList>
          }
          { this.state.mounted && 
              <Pagination
                params={this.state.params}
                updateParams={this.updateParams}
                count={this.state.count}
              />
          }

        </React.Fragment>
      </div>
    );
  }
}

export default withRouter(LegacyUsers);

LegacyUsers.contextType = AppContext;
