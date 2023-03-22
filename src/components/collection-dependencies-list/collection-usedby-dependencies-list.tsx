import { t } from '@lingui/macro';
import {
  SearchInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CollectionUsedByDependencies } from 'src/api';
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
  usedByDependencies: CollectionUsedByDependencies[];
  usedByDependenciesLoading: boolean;
  itemCount: number;
  params: {
    page?: number;
    page_size?: number;
    sort?: string;
    version?: string;
    name__icontains?: string;
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
  const ignoredParams = ['page_size', 'page', 'sort', 'name__icontains'];

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
      <div className='hub-toolbar'>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarItem>
              <SearchInput
                value={params.name__icontains || ''}
                onChange={(_e, val) =>
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
