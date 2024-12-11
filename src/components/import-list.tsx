import { t } from '@lingui/core/macro';
import { Toolbar } from '@patternfly/react-core';
import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import {
  type ImportListType,
  MyNamespaceAPI,
  type NamespaceType,
  PulpStatus,
} from 'src/api';
import {
  AppliedFilters,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  HubPagination,
  LoadingSpinner,
  Typeahead,
} from 'src/components';
import { ParamHelper, filterIsSet, jsxErrorMessage } from 'src/utilities';
import './my-imports.scss';

interface IProps {
  addAlert: (alert) => void;
  importList: ImportListType[];
  loading: boolean;
  numberOfResults: number;
  params: {
    keyword?: string;
    namespace?: string;
    page?: number;
    page_size?: number;
  };
  selectImport: (x) => void;
  selectedImport: ImportListType;
  updateParams: (filters) => void;
}

export const ImportList = ({
  addAlert,
  importList,
  loading,
  numberOfResults,
  params,
  selectImport,
  selectedImport,
  updateParams,
}: IProps) => {
  const [inputText, setInputText] = useState<string>('');
  const [namespaces, setNamespaces] = useState<NamespaceType[]>([]);

  useEffect(() => loadNamespaces(params.namespace), []);

  return (
    <div className='import-list'>
      {renderApiSearchAhead()}
      <Toolbar>
        <CompoundFilter
          inputText={inputText}
          onChange={(text) => setInputText(text)}
          updateParams={(p) => updateParams(p)}
          params={params}
          filterConfig={[
            {
              id: 'keywords',
              title: t`Name`,
            },
            {
              id: 'state',
              title: t`Status`,
              inputType: 'select',
              options: [
                {
                  id: 'completed',
                  title: t`Completed`,
                },
                {
                  id: 'failed',
                  title: t`Failed`,
                },
                {
                  id: 'running',
                  title: t`Running`,
                },
                {
                  id: 'waiting',
                  title: t`Waiting`,
                },
              ],
            },
          ]}
        />
      </Toolbar>

      <AppliedFilters
        updateParams={(p) => {
          updateParams(p);
          setInputText('');
        }}
        params={params}
        ignoredParams={['page_size', 'page', 'sort', 'ordering', 'namespace']}
        niceNames={{
          keywords: t`Name`,
          state: t`Status`,
        }}
      />

      <div data-cy='import-list-data'>
        {renderList(selectImport, importList, selectedImport, loading)}
      </div>
      {params.namespace && (
        <HubPagination
          count={numberOfResults}
          isCompact
          params={params}
          updateParams={updateParams}
        />
      )}
    </div>
  );

  function renderList(selectImport, importList, selectedImport, loading) {
    if (!params.namespace) {
      return (
        <EmptyStateNoData title={t`No namespace selected.`} description={''} />
      );
    }

    if (loading) {
      return (
        <div className='loading'>
          <LoadingSpinner />
        </div>
      );
    }

    if (
      importList.length === 0 &&
      !filterIsSet(params, ['keywords', 'state'])
    ) {
      return (
        <EmptyStateNoData
          title={t`No imports`}
          description={t`There have not been any imports on this namespace.`}
        />
      );
    } else if (importList.length === 0) {
      return <EmptyStateFilter />;
    }

    return (
      <div>
        {importList.map((item) => {
          return (
            <div
              onClick={() => selectImport(item)}
              key={item.id}
              className={cx({
                clickable: true,
                'list-container': true,
                'hub-c-toolbar__item-selected-item':
                  item.type === selectedImport.type &&
                  item.id === selectedImport.id,
              })}
              data-cy={`ImportList-row-${item.name}`}
            >
              <div style={{ marginRight: '10px' }}>
                <i
                  style={{ fontSize: '12px' }}
                  className={getStatusClass(item.state)}
                />
              </div>
              <div>{renderDescription(item)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderDescription(item) {
    return (
      <div>
        <div>
          <span data-cy='item-name'>{item.name}</span>{' '}
          {item.version ? 'v' + item.version : ''}
        </div>
        <div style={{ fontWeight: 'normal' }}>
          Status: {item.state}{' '}
          {item.finished_at ? <DateComponent date={item.finished_at} /> : null}
        </div>
      </div>
    );
  }

  function getStatusClass(state) {
    switch (state) {
      case PulpStatus.running:
        return 'fa fa-spin fa-spinner warning';
      case PulpStatus.waiting:
        return 'fa fa-spin fa-spinner warning';
      case PulpStatus.completed:
        return 'fa fa-circle success';
      default:
        return 'fa fa-circle failed';
    }
  }

  function loadNamespaces(namespace_filter) {
    if (!namespace_filter) {
      namespace_filter = '';
    }
    MyNamespaceAPI.list({ page_size: 10, keywords: namespace_filter })
      .then((result) => {
        setNamespaces(result.data.data);
      })
      .catch((e) =>
        addAlert({
          variant: 'danger',
          title: t`Namespaces list could not be displayed.`,
          description: jsxErrorMessage(e.status, e.statusText),
        }),
      );
  }

  function renderApiSearchAhead() {
    return (
      <div className='namespace-selector-wrapper'>
        <div className='label'>{t`Namespace`}</div>
        <div className='selector'>
          <Typeahead
            loadResults={(name) => loadNamespaces(name)}
            onSelect={(event, value) => {
              const p = ParamHelper.setParam(params, 'namespace', value);
              p['page'] = 1;
              updateParams(p);
            }}
            onClear={() => {
              const p = ParamHelper.setParam(params, 'namespace', '');
              p['page'] = 1;
              updateParams(p);
            }}
            placeholderText={t`Select namespace`}
            selections={[{ id: -1, name: params.namespace }]}
            results={namespaces}
          />
        </div>
      </div>
    );
  }
};
