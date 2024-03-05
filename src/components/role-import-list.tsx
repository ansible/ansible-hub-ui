import { t } from '@lingui/macro';
import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import { LegacyImportAPI, LegacyRoleImportDetailType } from 'src/api';
import {
  AlertType,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  HubPagination,
  LoadingPageSpinner,
} from 'src/components';
import { filterIsSet, handleHttpError } from 'src/utilities';

interface IProps {
  addAlert: (alert: AlertType) => void;
  params: {
    page?: number;
    page_size?: number;
    role_id?: number;
    sort?: string;
    state?: string;
  };
  selectImport: (item: LegacyRoleImportDetailType) => void;
  selectedImport?: LegacyRoleImportDetailType;
  updateParams: (params) => void;
}

const StatusIcon = ({ state }: { state: string }) => (
  <i
    style={{ fontSize: '12px' }}
    className={
      {
        running: 'fa fa-spin fa-spinner warning',
        waiting: 'fa fa-spin fa-spinner warning',
        success: 'fa fa-circle success',
        completed: 'fa fa-circle success',
      }[state?.toLowerCase()] || 'fa fa-circle failed'
    }
  />
);

export function RoleImportList({
  addAlert,
  params,
  selectImport,
  selectedImport,
  updateParams,
}: IProps) {
  const [count, setCount] = useState(0);
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = () => {
    setLoading(true);
    LegacyImportAPI.list({
      page: 1,
      page_size: 10,
      sort: '-created',
      ...params,
      detail: true,
    })
      .then(({ data: { count, results } }) => {
        setImports(results);
        setCount(count);
      })
      .catch(
        handleHttpError(t`Failed to list role imports`, () => null, addAlert),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    query();
  }, [params]);

  const statusMap = {
    SUCCESS: t`Completed`,
    FAILED: t`Failed`,
    RUNNING: t`Running`,
    WAITING: t`Waiting`,
  };

  return (
    <div className='import-list'>
      <HubListToolbar
        count={count}
        filterConfig={[
          /* FIXME: Bad Request: Enter a number.
          {
            id: 'role_name',
            title: t`Name`,
          },
          {
            id: 'namespace_name',
            title: t`Namespace`,
          }, */
          {
            id: 'state',
            title: t`Status`,
            inputType: 'select',
            options: [
              {
                id: 'SUCCESS',
                title: t`Completed`,
              },
              {
                id: 'FAILED',
                title: t`Failed`,
              },
              {
                id: 'RUNNING',
                title: t`Running`,
              },
              {
                id: 'WAITING',
                title: t`Waiting`,
              },
            ],
          },
        ]}
        ignoredParams={[
          'limit',
          'offset',
          'order_by',
          'ordering',
          'page',
          'page_size',
          'sort',
        ]}
        params={params}
        updateParams={updateParams}
      />

      <div data-cy='import-list-data'>
        {loading ? (
          <div className='loading'>
            <LoadingPageSpinner />
          </div>
        ) : !count &&
          filterIsSet(params, ['role_name', 'namespace_name', 'state']) ? (
          <EmptyStateFilter />
        ) : !count ? (
          <EmptyStateNoData
            title={t`No imports`}
            description={t`There have not been any imports.`}
          />
        ) : (
          <div>
            {imports.map((item) => (
              <div
                onClick={() => selectImport(item)}
                key={item.pulp_id}
                className={cx({
                  clickable: true,
                  'list-container': true,
                  'hub-c-toolbar__item-selected-item':
                    item.pulp_id === selectedImport?.pulp_id,
                })}
                data-cy={`RoleImportList-row-${item.role_id}`}
              >
                <div style={{ marginRight: '10px' }}>
                  <StatusIcon state={item.state} />
                </div>
                <div>
                  <div>
                    <div>
                      <span data-cy='item-name'>
                        {item.summary_fields?.github_user}/
                        {item.summary_fields?.github_repo}
                      </span>{' '}
                    </div>
                    <div style={{ fontWeight: 'normal' }}>
                      Status: {statusMap[item.state] || item.state}{' '}
                      {item.summary_fields?.task_messages?.at(-1)?.id ? (
                        <DateComponent
                          date={item.summary_fields.task_messages.at(-1).id}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && count ? (
        <HubPagination
          count={count}
          isCompact
          params={params}
          updateParams={updateParams}
        />
      ) : null}
    </div>
  );
}
