import { t } from '@lingui/macro';
import * as React from 'react';
import './list.scss';

import { Button, DropdownItem, DataList } from '@patternfly/react-core';

import { LegacyUserListType } from 'src/api';
import { Constants } from 'src/constants';
import {
  LegacyUserListItem,
  Pagination,
  StatefulDropdown,
  EmptyStateFilter,
} from 'src/components';
import { ParamHelper } from 'src/utilities/param-helper';

interface IProps {
  legacyusers: LegacyUserListType[];
  params: {
    sort?: string;
    page?: number;
    page_size?: number;
  };
  updateParams: (params) => void;
  itemCount: number;
  ignoredParams: string[];

  showNamespace?: boolean;
  showControls?: boolean;
  handleControlClick?: (id, event) => void;
  repo?: string;
}

// only used in namespace detail, collections uses individual items
export class LegacyUserList extends React.Component<IProps> {
  render() {
    const {
      //context,
      //setState,
      //forceUpdate,
      //render,
      legacyusers,
      params,
      updateParams,
      ignoredParams,
      itemCount,
      showControls,
      //repo,
    } = this.props;

    console.log('legacyrolelist props', this.props);

    return (
      <div>
        <h1>LegacyUserList Component</h1>
        <React.Fragment>
          <DataList aria-label={t`List of Roles`}>
            {legacyusers.length > 0 ? (
              legacyusers.map((r) => <h2>USER</h2>)
            ) : (
              <EmptyStateFilter />
            )}
          </DataList>
          <Pagination
            params={params}
            updateParams={(p) => updateParams(p)}
            count={itemCount}
          />
        </React.Fragment>
      </div>
    );
  }

  private renderLegacyUserControls(legacyrole: LegacyUserListType) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2>ROLE CONTROL</h2>
      </div>
    );
  }
}

/*
export class LegacyRoleListItem extends React.Component {
    render() {
        return (<div><h2>LegacyRoleListItem</h2></div>)
    }
}
*/
