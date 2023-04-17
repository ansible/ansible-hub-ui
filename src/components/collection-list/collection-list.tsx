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
  collectionControls: (collection) => {
    dropdownMenu?: React.ReactNode | null;
    synclistSwitch?: React.ReactNode | null;
    uploadButton?: React.ReactNode | null;
  };
}

// only used in namespace detail, collections uses individual items
export const CollectionList = (props: IProps) => {
  const {
    collections,
    collectionControls,
    displaySignatures,
    params,
    updateParams,
    ignoredParams,
    itemCount,
  } = props;

  return (
    <React.Fragment>
      <DataList aria-label={t`List of Collections`}>
        {collections.length > 0 ? (
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
        params={params}
        updateParams={(p) => updateParams(p)}
        count={itemCount}
      />
    </React.Fragment>
  );
};
