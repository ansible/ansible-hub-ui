import { t } from '@lingui/macro';
import * as React from 'react';
import './list.scss';

import { Button, DropdownItem, DataList } from '@patternfly/react-core';

import { LegacyRoleListType } from 'src/api';
import { Constants } from 'src/constants';
import {
  LegacyRoleListItem,
  Pagination,
  StatefulDropdown,
  EmptyStateFilter,
} from 'src/components';
import { ParamHelper } from 'src/utilities/param-helper';

interface IProps {
  legacyroles: LegacyRoleListType[];
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
export class LegacyRoleList extends React.Component<IProps> {
  render() {
    const {
      //context,
      //setState,
      //forceUpdate,
      //render,
      legacyroles,
      params,
      updateParams,
      ignoredParams,
      itemCount,
      showControls,
      //repo,
    } = this.props;

    console.log('legacyrolelist props', this.props);

    console.log('LEGACY ROLE LIST 1');

    return (
      <div>
        <h1>LegacyRoleList Component</h1>
        <React.Fragment>
          <DataList aria-label={t`List of Roles`}>
            {legacyroles.length > 0 ? (
              legacyroles.map((r) => <h2>ROLE</h2>)
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

  private renderLegacyRoleControls(legacyrole: LegacyRoleListType) {
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
