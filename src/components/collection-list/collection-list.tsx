import { t } from '@lingui/macro';
import * as React from 'react';
import './list.scss';

import { DataList } from '@patternfly/react-core';
import { CollectionListType } from 'src/api';

import {
  CollectionListItem,
  Pagination,
  EmptyStateFilter,
} from 'src/components';
import { ParamHelper } from 'src/utilities/param-helper';

interface IProps {
  collections: CollectionListType[];
  displaySignatures: boolean;
  params: {
    sort?: string;
    page?: number;
    page_size?: number;
  };
  updateParams: (params) => void;
  itemCount: number;
  ignoredParams: string[];
  showControls?: boolean;
  repo?: string;
  renderCollectionControls: (collection) => React.ReactNode;
}

// only used in namespace detail, collections uses individual items
export class CollectionList extends React.Component<IProps> {
  render() {
    const {
      collections,
      displaySignatures,
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
                  showControls ? this.props.renderCollectionControls(c) : null
                }
                key={c.id}
                {...c}
                repo={repo}
                displaySignatures={displaySignatures}
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
}
