import { t } from '@lingui/macro';
import { Pagination, Toolbar } from '@patternfly/react-core';
import cx from 'classnames';
import * as React from 'react';
import {
  ImportListType,
  MyNamespaceAPI,
  NamespaceType,
  PulpStatus,
} from 'src/api';
import {
  APISearchTypeAhead,
  AppliedFilters,
  CompoundFilter,
  LoadingPageSpinner,
} from 'src/components';
import { Constants } from 'src/constants';
import { errorMessage, filterIsSet } from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
import { DateComponent, EmptyStateFilter, EmptyStateNoData } from '..';
import './my-imports.scss';

interface IProps {
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
  addAlert: (alert) => void;
}

interface IState {
  kwField: string;
  inputText: string;
  namespaces: NamespaceType[];
}

export class ImportList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      kwField: '',
      inputText: '',
      namespaces: [],
    };
  }

  componentDidMount() {
    this.loadNamespaces(this.props.params.namespace);
  }

  render() {
    const {
      selectImport,
      importList,
      selectedImport,
      numberOfResults,
      params,
      updateParams,
      loading,
    } = this.props;

    return (
      <div className='import-list'>
        {this.renderApiSearchAhead()}
        <Toolbar>
          <CompoundFilter
            inputText={this.state.inputText}
            onChange={(text) => this.setState({ inputText: text })}
            updateParams={(p) => this.props.updateParams(p)}
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
            this.props.updateParams(p);
            this.setState({ inputText: '' });
          }}
          params={params}
          ignoredParams={['page_size', 'page', 'sort', 'ordering', 'namespace']}
          niceNames={{
            keywords: t`Name`,
            state: t`Status`,
          }}
        />

        <div data-cy='import-list-data'>
          {this.renderList(selectImport, importList, selectedImport, loading)}
        </div>
        {this.props.params.namespace && (
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
        )}
      </div>
    );
  }

  private renderList(selectImport, importList, selectedImport, loading) {
    if (!this.props.params.namespace) {
      return (
        <EmptyStateNoData title={t`No namespace selected.`} description={''} />
      );
    }

    if (loading) {
      return (
        <div className='loading'>
          <LoadingPageSpinner />
        </div>
      );
    }

    if (
      importList.length === 0 &&
      !filterIsSet(this.props.params, ['keywords', 'state'])
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
          <span data-cy='item-name'>{item.name}</span>{' '}
          {item.version ? 'v' + item.version : ''}
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

  private loadNamespaces(namespace_filter) {
    if (!namespace_filter) {
      namespace_filter = '';
    }
    MyNamespaceAPI.list({ page_size: 10, keywords: namespace_filter })
      .then((result) => {
        this.setState({ namespaces: result.data.data });
      })
      .catch((e) =>
        this.props.addAlert({
          variant: 'danger',
          title: t`Namespaces list could not be displayed.`,
          description: errorMessage(e.status, e.statusText),
        }),
      );
  }

  private renderApiSearchAhead() {
    return (
      <div className='namespace-selector-wrapper'>
        <div className='label'>{t`Namespace`}</div>
        <div className='selector'>
          <APISearchTypeAhead
            loadResults={(name) => this.loadNamespaces(name)}
            onSelect={(event, value) => {
              const params = ParamHelper.setParam(
                this.props.params,
                'namespace',
                value,
              );
              params['page'] = 1;
              this.props.updateParams(params);
            }}
            onClear={() => {
              const params = ParamHelper.setParam(
                this.props.params,
                'namespace',
                '',
              );
              params['page'] = 1;
              this.props.updateParams(params);
            }}
            placeholderText={t`Select namespace`}
            selections={[{ id: -1, name: this.props.params.namespace }]}
            results={this.state.namespaces}
          />
        </div>
      </div>
    );
  }
}
