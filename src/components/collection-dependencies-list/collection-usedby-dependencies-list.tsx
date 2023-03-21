import { t } from '@lingui/macro';
import {
  SearchInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CollectionVersionSearch } from 'src/api';
import {
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Pagination,
  Sort,
} from 'src/components';
import 'src/containers/collection-detail/collection-dependencies.scss';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, filterIsSet } from 'src/utilities';

interface IProps {
  usedByDependencies: CollectionVersionSearch[];
  usedByDependenciesLoading: boolean;
  itemCount: number;
  params: {
    page?: number;
    page_size?: number;
    order_by?: string;
    version?: string;
    name?: string; // collection version search is missing name__icontains
  };
  updateParams: (params) => void;
}

export const CollectionUsedbyDependenciesList = ({
  params,
  usedByDependencies,
  itemCount,
  updateParams,
  usedByDependenciesLoading,
}: IProps) => {
  const ignoredParams = ['page_size', 'page', 'order_by', 'name'];

  if (!itemCount && !filterIsSet(params, ['name'])) {
    return (
      <EmptyStateNoData
        title={t`Not required for use by other collections`}
        description={t`Collection is not being used by any collection.`}
      />
    );
  }

  return (
    <>
      <div className='hub-toolbar'>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarItem>
              <SearchInput
                value={params.name || ''}
                onChange={(_e, val) =>
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
                options={[{ title: t`Collection`, id: 'name', type: 'alpha' }]}
                sortParamName={'order_by'}
                params={params}
                updateParams={({ order_by }) => {
                  updateParams(
                    ParamHelper.setParam(params, 'order_by', order_by),
                  );
                }}
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
                    (
                      {
                        collection_version: { name, namespace, version },
                        repository,
                      },
                      i,
                    ) => (
                      <tr key={i}>
                        <td>
                          <Link
                            to={formatPath(
                              Paths.collectionByRepo,
                              {
                                collection: name,
                                namespace,
                                repo: repository.name,
                              },
                              ParamHelper.getReduced(
                                { version },
                                ignoredParams,
                              ),
                            )}
                          >
                            {namespace + '.' + name} v{version}
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
};
