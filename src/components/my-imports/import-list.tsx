import * as React from 'react';
import cx from 'classnames';
import './my-imports.scss';
import {
  Pagination,
  FormSelect,
  FormSelectOption,
  Spinner,
  Toolbar,
} from '@patternfly/react-core';
import { AppliedFilters, CompoundFilter } from 'src/components';
import { PulpStatus, NamespaceType, ImportListType } from 'src/api';
import { ParamHelper } from 'src/utilities/param-helper';
import { filterIsSet } from 'src/utilities';
import { Constants } from 'src/constants';
import { DateComponent, EmptyStateNoData, EmptyStateFilter } from '..';

interface IProps {
  namespaces: NamespaceType[];
  importList: ImportListType[];
  selectedImport: ImportListType;
  numberOfResults: number;
  loading: boolean;
  params: {
    page_size?: number;
    page?: number;
    keyword?: string;
    namespace?: string;
  };

  selectImport: (x) => void;
  updateParams: (filters) => void;
}

interface IState {
  kwField: string;
}

export class ImportList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      kwField: '',
    };
  }

  render() {
    const {
      selectImport,
      importList,
      selectedImport,
      namespaces,
      numberOfResults,
      params,
      updateParams,
      loading,
    } = this.props;

    return (
      <div className='import-list'>
        {this.renderNamespacePicker(namespaces)}
        <Toolbar>
          <CompoundFilter
            updateParams={(p) => {
              p['page'] = 1;
              this.props.updateParams(p);
            }}
            params={params}
            filterConfig={[
              {
                id: 'keywords',
                title: _`Name`,
              },
              {
                id: 'state',
                title: _`Status`,
                inputType: 'select',
                options: [
                  {
                    id: 'completed',
                    title: _`Completed`,
                  },
                  {
                    id: 'failed',
                    title: _`Failed`,
                  },
                  {
                    id: 'running',
                    title: _`Running`,
                  },
                  {
                    id: 'waiting',
                    title: _`Waiting`,
                  },
                ],
              },
            ]}
          />
        </Toolbar>
        <AppliedFilters
          updateParams={(p) => {
            p['page'] = 1;
            this.props.updateParams(p);
          }}
          params={params}
          ignoredParams={['page_size', 'page', 'sort', 'ordering', 'namespace']}
          niceNames={{
            keywords: _`Name`,
            state: _`Status`,
          }}
        />

        <div>
          {this.renderList(selectImport, importList, selectedImport, loading)}
        </div>
        <Pagination
          itemCount={numberOfResults}
          perPage={params.page_size || Constants.DEFAULT_PAGE_SIZE}
          page={params.page || 1}
          onSetPage={(_, p) =>
            updateParams(ParamHelper.setParam(params, 'page', p))
          }
          onPerPageSelect={(_, p) => {
            updateParams({ ...params, page: 1, page_size: p });
          }}
          isCompact={true}
        />
      </div>
    );
  }

  private renderList(selectImport, importList, selectedImport, loading) {
    if (loading) {
      return (
        <div className='loading'>
          <Spinner />
        </div>
      );
    }
    if (
      importList.length === 0 &&
      !filterIsSet(this.props.params, ['keywords', 'state'])
    ) {
      return (
        <EmptyStateNoData
          title={_`No imports`}
          description={_`There have not been any imports on this namespace.`}
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
                'selected-item':
                  item.type === selectedImport.type &&
                  item.id === selectedImport.id,
              })}
            >
              <div className='left'>
                <i className={this.getStatusClass(item.state)} />
              </div>
              <div className='right'>{this.renderDescription(item)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private renderDescription(item) {
    return (
      <div>
        <div>
          {item.name} {item.version ? 'v' + item.version : ''}
        </div>
        <div className='sub-text'>
          Status: {item.state}{' '}
          {item.finished_at ? <DateComponent date={item.finished_at} /> : null}
        </div>
      </div>
    );
  }

  private getStatusClass(state) {
    const statusClass = 'fa status-icon ';

    switch (state) {
      case PulpStatus.running:
        return statusClass + 'fa-spin fa-spinner warning';
      case PulpStatus.waiting:
        return statusClass + 'fa-spin fa-spinner warning';
      case PulpStatus.completed:
        return statusClass + 'fa-circle success';
      default:
        return statusClass + 'fa-circle failed';
    }
  }

  private renderNamespacePicker(namespaces) {
    return (
      <div className='namespace-selector-wrapper'>
        <div className='label'>{_`Namespace`}</div>
        <div className='selector'>
          <FormSelect
            onChange={(val) => {
              const params = ParamHelper.setParam(
                this.props.params,
                'namespace',
                val,
              );
              params['page'] = 1;
              this.props.updateParams(params);
            }}
            value={this.props.params.namespace}
            aria-label={_`Select namespace`}
          >
            {namespaces.map((ns) => (
              <FormSelectOption key={ns.name} label={ns.name} value={ns.name} />
            ))}
          </FormSelect>
        </div>
      </div>
    );
  }
}
