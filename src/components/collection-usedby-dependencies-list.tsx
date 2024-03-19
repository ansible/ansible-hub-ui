import { t } from '@lingui/macro';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import React from 'react';
import { Link } from 'react-router-dom';
import { type CollectionUsedByDependencies } from 'src/api';
import {
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  HubPagination,
  LoadingSpinner,
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
  if (!itemCount && !filterIsSet(params, ['name__icontains'])) {
    return (
      <EmptyStateNoData
        title={t`Not required for use by other collections`}
        description={t`Collection is not being used by any collection.`}
      />
    );
  }

  const ignoredParams = ['page_size', 'page', 'sort'];

  const filterConfig = [
    {
      id: 'name__icontains',
      title: t`Name`,
    },
  ];

  const sortOptions = [
    { title: t`Collection`, id: 'collection', type: 'alpha' as const },
  ];

  return (
    <>
      <HubListToolbar
        count={itemCount}
        filterConfig={filterConfig}
        ignoredParams={ignoredParams}
        params={params}
        sortOptions={sortOptions}
        updateParams={updateParams}
      />

      {usedByDependenciesLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {!itemCount ? (
            <EmptyStateFilter />
          ) : (
            <>
              <Table variant='compact'>
                <Tbody>
                  {usedByDependencies.map(
                    ({ name, namespace, version, repository_list }, i) => (
                      <Tr key={i}>
                        <Td>
                          <Link
                            to={formatPath(
                              Paths.collectionByRepo,
                              {
                                collection: name,
                                namespace,
                                repo: repository_list[0],
                              },
                              ParamHelper.getReduced({ version }, [
                                ...ignoredParams,
                                'name__icontains',
                              ]),
                            )}
                          >
                            {namespace + '.' + name} v{version}
                          </Link>
                        </Td>
                      </Tr>
                    ),
                  )}
                </Tbody>
              </Table>
              <HubPagination
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
