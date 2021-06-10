import * as React from 'react';
import './list.scss';

import { Button, DropdownItem, DataList } from '@patternfly/react-core';

import { CollectionListType } from 'src/api';
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
        <DataList aria-label={'List of Collections'}>
          {collections.length > 0 ? (
            collections.map(c => (
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

        <div className='controls bottom'>
          <div></div>
          <div>
            <Pagination
              params={params}
              updateParams={p => updateParams(p)}
              count={itemCount}
            />
          </div>
        </div>
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
          Upload new version
        </Button>
        <StatefulDropdown
          items={[
            <DropdownItem
              onClick={e =>
                this.props.handleControlClick(collection.id, 'deprecate')
              }
              key='1'
            >
              {collection.deprecated ? 'Undeprecate' : 'Deprecate'}
            </DropdownItem>,
          ]}
        />
      </div>
    );
  }
}
