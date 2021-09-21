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
    name?: string;
  };
  updateParams: (params) => void;
}

export class CollectionUsedbyDependenciesList extends React.Component<IProps> {
  private ignoredParams = ['page_size', 'page', 'sort', 'name'];

  render() {
    const {
      params,
      usedByDependencies,
      itemCount,
      updateParams,
      repo,
      usedByDependenciesLoading,
    } = this.props;

    if (!itemCount && !filterIsSet(params, ['name']))
      return (
        <EmptyStateNoData
          title={t`No collection is using this dependency`}
          description={t`Collection is not being used by any collection.`}
        />
      );

    return (
      <>
        <div className='usedby-dependencies-header'>
          <Toolbar>
            <ToolbarGroup>
              <ToolbarItem>
                <SearchInput
                  value={params.name || ''}
                  onChange={(val) =>
                    updateParams(ParamHelper.setParam(params, 'name', val))
                  }
                  onClear={() =>
                    updateParams(ParamHelper.setParam(params, 'name', ''))
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
                <table className='content-table pf-c-table pf-m-compact'>
                  <tbody>
                    {usedByDependencies.map(
                      ({ name, namespace, version }, i) => (
                        <tr key={i}>
                          <td>
                            <Link
                              to={formatPath(
                                Paths.collectionByRepo,
                                {
                                  collection: name,
                                  namespace: namespace,
                                  repo,
                                },
                                ParamHelper.getReduced(
                                  { version },
                                  this.ignoredParams,
                                ),
                              )}
                            >
                              {name}
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
