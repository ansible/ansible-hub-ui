import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { ActionType } from 'src/actions';
import {
  AppliedFilters,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  FilterOption,
  LoadingPageSpinner,
  Pagination,
  Query,
  RenderTableRow,
  SortHeaders,
  SortTable,
} from 'src/components';
import { filterIsSet, handleHttpError } from 'src/utilities';

interface IProps<T> {
  actionContext: {
    addAlert;
    hasObjectPermission?;
    hasPermission;
    query;
    setState;
    state;
  };
  defaultPageSize: number;
  defaultSort?: string;
  errorTitle: string;
  filterConfig?: FilterOption[];
  headerActions?: ActionType[];
  listItemActions?: ActionType[];
  noDataButton?: (item, actionContext) => React.ReactNode;
  noDataDescription: string;
  noDataTitle: string;
  query: Query<T>;
  renderTableRow: RenderTableRow<T>;
  sortHeaders: SortHeaders;
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
        <LoadingPageSpinner />
      ) : (
        <>
          <div className='hub-list-toolbar' data-cy={`DetailList`}>
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

            <Pagination
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
            <LoadingPageSpinner />
          ) : !items.length ? (
            <EmptyStateFilter />
          ) : (
            <table
              aria-label={title}
              className='hub-c-table-content pf-c-table'
            >
              <SortTable
                options={{ headers: sortHeaders }}
                params={params}
                updateParams={setParams}
              />
              <tbody>
                {items.map((item, i) =>
                  renderTableRow(item, i, actionContext, listItemActions),
                )}
              </tbody>
            </table>
          )}
          <Pagination
            params={params}
            updateParams={setParams}
            count={itemCount}
          />
        </>
      )}
    </>
  );
}
