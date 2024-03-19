import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Tbody } from '@patternfly/react-table';
import React, { type ReactNode, useEffect, useState } from 'react';
import { type ActionType } from 'src/actions';
import {
  AppliedFilters,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  type FilterOption,
  HubPagination,
  LoadingSpinner,
  type LocalizedSortHeaders,
  type Query,
  type RenderTableRow,
  SortTable,
} from 'src/components';
import { filterIsSet, handleHttpError } from 'src/utilities';

interface IProps<T> {
  actionContext: {
    addAlert;
    hasObjectPermission?;
    hasPermission;
    query;
    setState?;
    state?;
  };
  defaultPageSize: number;
  defaultSort?: string;
  errorTitle: string;
  filterConfig?: FilterOption[];
  headerActions?: ActionType[];
  listItemActions?: ActionType[];
  noDataButton?: (item, actionContext) => ReactNode;
  noDataDescription: string;
  noDataTitle: string;
  query: Query<T>;
  renderTableRow: RenderTableRow<T>;
  sortHeaders: LocalizedSortHeaders;
  title: string;
}

export function DetailList<T>({
  actionContext,
  defaultPageSize,
  defaultSort,
  errorTitle,
  filterConfig,
  headerActions,
  listItemActions,
  noDataButton,
  noDataDescription,
  noDataTitle,
  query,
  renderTableRow,
  sortHeaders,
  title,
}: IProps<T>) {
  const { addAlert } = actionContext;
  const [items, setItems] = useState<T[]>([]);
  const [params, setParams] = useState({
    page: 1,
    page_size: defaultPageSize,
    sort: defaultSort,
  });
  const [inputText, setInputText] = useState('');
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    query({ params })
      .then(({ data: { count, results } }) => {
        setItems(results);
        setItemCount(count);
      })
      .catch(handleHttpError(errorTitle, () => setItems([]), addAlert))
      .then(() => setLoading(false));
  }, [params]);

  const renderModals = (actionContext) => (
    <>
      {headerActions?.length
        ? headerActions.map((action) => action?.modal?.(actionContext))
        : null}
      {listItemActions?.length
        ? listItemActions.map((action) => action?.modal?.(actionContext))
        : null}
    </>
  );

  const knownFilters = (filterConfig || []).map(({ id }) => id);
  const noData = items.length === 0 && !filterIsSet(params, knownFilters);

  const niceNames = Object.fromEntries(
    (filterConfig || []).map(({ id, title }) => [id, title]),
  );

  return (
    <>
      {renderModals?.(actionContext)}
      {noData && !loading ? (
        <EmptyStateNoData
          button={<>{noDataButton?.(null, actionContext)}</>}
          description={noDataDescription}
          title={noDataTitle}
        />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className='hub-toolbar' data-cy={`DetailList`}>
            <Toolbar>
              <ToolbarContent>
                <ToolbarGroup>
                  <ToolbarItem>
                    <CompoundFilter
                      inputText={inputText}
                      onChange={setInputText}
                      updateParams={setParams}
                      params={params}
                      filterConfig={filterConfig || []}
                    />
                  </ToolbarItem>
                  {headerActions?.length &&
                    headerActions.map((action) => (
                      <ToolbarItem key={action.title}>
                        {action.button(null, actionContext)}
                      </ToolbarItem>
                    ))}
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>

            <HubPagination
              params={params}
              updateParams={setParams}
              count={itemCount}
              isTop
            />
          </div>
          <div>
            <AppliedFilters
              updateParams={(p) => {
                setParams(p);
                setInputText('');
              }}
              params={params}
              ignoredParams={['page_size', 'page', 'sort', 'ordering']}
              niceNames={niceNames}
            />
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : !items.length ? (
            <EmptyStateFilter />
          ) : (
            <Table aria-label={title}>
              <SortTable
                options={{ headers: sortHeaders }}
                params={params}
                updateParams={setParams}
              />
              <Tbody>
                {items.map((item, i) =>
                  renderTableRow(item, i, actionContext, listItemActions),
                )}
              </Tbody>
            </Table>
          )}
          <HubPagination
            params={params}
            updateParams={setParams}
            count={itemCount}
          />
        </>
      )}
    </>
  );
}
