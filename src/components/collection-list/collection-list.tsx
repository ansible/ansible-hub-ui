import { t } from '@lingui/macro';
import { DataList } from '@patternfly/react-core';
import React from 'react';
import { CollectionVersionSearch } from 'src/api';
import {
  CollectionListItem,
  EmptyStateFilter,
  Pagination,
} from 'src/components';
import { ParamHelper } from 'src/utilities';
import './list.scss';

interface IProps {
  collectionControls: (collection) => {
    dropdownMenu?: React.ReactNode | null;
    uploadButton?: React.ReactNode | null;
  };
  collections: CollectionVersionSearch[];
  displaySignatures: boolean;
  ignoredParams: string[];
  itemCount: number;
  params: {
    page?: number;
    page_size?: number;
    sort?: string;
  };
  updateParams: (params) => void;
}

// only used in namespace detail, collections uses individual items
export const CollectionList = ({
  collectionControls,
  collections,
  displaySignatures,
  ignoredParams,
  itemCount,
  params,
  updateParams,
}: IProps) => {
  return (
    <>
      <DataList aria-label={t`List of Collections`}>
        {collections.length ? (
          collections.map((c, i) => (
            <CollectionListItem
              key={i}
              collection={c}
              displaySignatures={displaySignatures}
              showNamespace
              {...collectionControls(c)}
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
        count={itemCount}
        params={params}
        updateParams={updateParams}
      />
    </>
  );
};
