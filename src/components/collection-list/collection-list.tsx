import { t } from '@lingui/macro';
import * as React from 'react';
import './list.scss';

import { Button, DropdownItem, DataList } from '@patternfly/react-core';

import { CollectionListType } from 'src/api';
import { Constants } from 'src/constants';
import {
  CollectionListItem,
  Pagination,
  StatefulDropdown,
  EmptyStateFilter,
} from 'src/components';
import { ParamHelper } from 'src/utilities/param-helper';

interface IProps {
  collections: CollectionListType[];
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
export class CollectionList extends React.Component<IProps> {
  render() {
    const {
      collections,
      params,
      updateParams,
      ignoredParams,
      itemCount,
      showControls,
      repo,
    } = this.props;

    return (
      <React.Fragment>
        <DataList aria-label={t`List of Collections`}>
          {collections.length > 0 ? (
            collections.map((c) => (
              <CollectionListItem
                controls={
                  showControls ? this.renderCollectionControls(c) : null
                }
                key={c.id}
                {...c}
                repo={repo}
              />
            ))
          ) : (
            <EmptyStateFilter
              clearAllFilters={() => {
                ParamHelper.clearAllFilters({
                  params,
                  ignoredParams,
                  updateParams,
                });
              }}
            />
          )}
        </DataList>
        <Pagination
          params={params}
          updateParams={(p) => updateParams(p)}
          count={itemCount}
        />
      </React.Fragment>
    );
  }

  private renderCollectionControls(collection: CollectionListType) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={() => this.props.handleControlClick(collection.id, 'upload')}
          variant='secondary'
        >
          {t`Upload new version`}
        </Button>
        <StatefulDropdown
          items={[
            <DropdownItem
              onClick={() =>
                this.props.handleControlClick(collection.id, 'deprecate')
              }
              key='deprecate'
              isDisabled={
                DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
              }
              description={
                DEPLOYMENT_MODE === Constants.INSIGHTS_DEPLOYMENT_MODE
                  ? t`Temporarily disabled due to sync issues. (AAH-1237)`
                  : null
              }
            >
              {collection.deprecated ? t`Undeprecate` : t`Deprecate`}
            </DropdownItem>,
          ]}
        />
      </div>
    );
  }
}
