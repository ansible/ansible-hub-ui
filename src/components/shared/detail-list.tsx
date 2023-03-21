import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { ActionType } from 'src/actions';
import {
  FilterOption,
  Query,
  RenderTableRow,
  SortHeaders,
} from 'src/components';
import { handleHttpError } from 'src/utilities';

interface IProps<T> {
  actionContext: { addAlert };
  defaultPageSize: number;
  defaultSort?: string;
  errorTitle: string;
  filterConfig?: FilterOption[];
  listItemActions?: ActionType[];
  noDataButton?: (item, actionContext) => React.ReactNode;
  noDataDescription: string;
  noDataTitle: string;
  query: Query<T>;
  renderTableRow: RenderTableRow<T>;
  sortHeaders: SortHeaders;
}

export function DetailList<T extends { pulp_href: string }>({
  actionContext: { addAlert },
  defaultPageSize,
  defaultSort,
  errorTitle,
  filterConfig,
  listItemActions,
  noDataButton,
  noDataDescription,
  noDataTitle,
  query,
  renderTableRow,
  sortHeaders,
}: IProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [params, setParams] = useState({
    page: 1,
    page_size: defaultPageSize,
  });

  useEffect(() => {
    query({ params })
      .then(({ data: { results } }) => setItems(results))
      .catch(
        handleHttpError(
          t`Failed to load repository versions`,
          () => setItems([]),
          addAlert,
        ),
      );
  }, []);

  return (
    <>
      {items.map((item) => (
        <div key={item.pulp_href}>
          <pre
            style={{ whiteSpace: 'pre-wrap' }}
            onClick={() => addAlert({ title: 'foo' })}
          >
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>
      ))}
    </>
  );
}
