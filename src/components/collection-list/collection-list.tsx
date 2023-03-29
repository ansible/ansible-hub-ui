import { t } from '@lingui/macro';
import { DataList } from '@patternfly/react-core';
import * as React from 'react';
import { CollectionVersionSearch } from 'src/api';
import {
  CollectionListItem,
  EmptyStateFilter,
  Pagination,
} from 'src/components';
import { ParamHelper } from 'src/utilities/param-helper';
import './list.scss';

interface IProps {
  collections: CollectionVersionSearch[];
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
  renderCollectionControls: (collection) => React.ReactNode;
}

// only used in namespace detail, collections uses individual items
export const CollectionList = (props: IProps) => {
  const {
    collections,
    displaySignatures,
    params,
    updateParams,
    ignoredParams,
    itemCount,
    showControls,
  } = props;

  return (
    <React.Fragment>
      <DataList aria-label={t`List of Collections`}>
        {collections.length > 0 ? (
          collections.map((c, i) => (
            <CollectionListItem
              controls={showControls ? props.renderCollectionControls(c) : null}
              key={i}
              {...c}
              displaySignatures={displaySignatures}
              showNamespace={true}
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
};
