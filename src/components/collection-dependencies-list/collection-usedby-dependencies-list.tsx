import { t } from '@lingui/macro';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { CollectionUsedByDependencies } from 'src/api';

import {
  Toolbar,
  ToolbarItem,
  ToolbarGroup,
  SearchInput,
} from '@patternfly/react-core';

import {
  Pagination,
  EmptyStateNoData,
  EmptyStateFilter,
  Sort,
  LoadingPageSpinner,
} from 'src/components';

import { ParamHelper, filterIsSet } from 'src/utilities';
import { formatPath, Paths } from 'src/paths';

import 'src/containers/collection-detail/collection-dependencies.scss';

interface IProps {
  usedByDependencies: CollectionUsedByDependencies[];
  usedByDependenciesLoading: boolean;
  repo: string;
  itemCount: number;
  params: {
    page?: number;
    page_size?: number;
    collection?: string;
    sort?: string;
    version?: string;
    name__icontains?: string;
  };
  updateParams: (params) => void;
}

export class CollectionUsedbyDependenciesList extends React.Component<IProps> {
  private ignoredParams = ['page_size', 'page', 'sort', 'name__icontains'];

  render() {
    const {
      params,
      usedByDependencies,
      itemCount,
      updateParams,
      usedByDependenciesLoading,
    } = this.props;

    if (!itemCount && !filterIsSet(params, ['name__icontains'])) {
      return (
        <EmptyStateNoData
          title={t`Not required for use by other collections`}
          description={t`Collection is not being used by any collection.`}
        />
      );
    }

    return (
      <>
        <div className='hub-usedby-dependencies-header'>
          <Toolbar>
            <ToolbarGroup>
              <ToolbarItem>
                <SearchInput
                  value={params.name__icontains || ''}
                  onChange={(val) =>
                    updateParams(
                      ParamHelper.setParam(params, 'name__icontains', val),
                    )
                  }
                  onClear={() =>
                    updateParams(
                      ParamHelper.setParam(params, 'name__icontains', ''),
                    )
                  }
                  aria-label='filter-collection-name'
                  placeholder={t`Filter by name`}
                />
              </ToolbarItem>
              <ToolbarItem>
                <Sort
                  options={[
                    { title: t`Collection`, id: 'collection', type: 'alpha' },
                  ]}
                  params={params}
                  updateParams={({ sort }) =>
                    updateParams(ParamHelper.setParam(params, 'sort', sort))
                  }
                />
              </ToolbarItem>
            </ToolbarGroup>
          </Toolbar>
          {!!itemCount && (
            <Pagination
              params={params}
              updateParams={(p) => updateParams(p)}
              count={itemCount}
              isTop
            />
          )}
        </div>

        {usedByDependenciesLoading ? (
          <LoadingPageSpinner />
        ) : (
          <>
            {!itemCount ? (
              <EmptyStateFilter />
            ) : (
              <>
                <table className='hub-c-table-content pf-c-table pf-m-compact'>
                  <tbody>
                    {usedByDependencies.map(
                      ({ name, namespace, version, repository_list }, i) => (
                        <tr key={i}>
                          <td>
                            <Link
                              to={formatPath(
                                Paths.collectionByRepo,
                                {
                                  collection: name,
                                  namespace,
                                  repo: repository_list[0],
                                },
                                ParamHelper.getReduced(
                                  { version },
                                  this.ignoredParams,
                                ),
                              )}
                            >
                              {name} v{version}
                            </Link>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
                <Pagination
                  params={params}
                  updateParams={(params) => updateParams(params)}
                  count={itemCount}
                />
              </>
            )}
          </>
        )}
      </>
    );
  }
}
