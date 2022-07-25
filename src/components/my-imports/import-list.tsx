import { t } from '@lingui/macro';
import * as React from 'react';
import cx from 'classnames';
import './my-imports.scss';
import {
  Pagination,
  FormSelect,
  FormSelectOption,
  Toolbar,
} from '@patternfly/react-core';
import {
  AppliedFilters,
  CompoundFilter,
  LoadingPageSpinner,
  APISearchTypeAhead,
} from 'src/components';
import {
  PulpStatus,
  NamespaceType,
  ImportListType,
  MyNamespaceAPI,
  NamespaceListType,
} from 'src/api';
import { ParamHelper } from 'src/utilities/param-helper';
import { filterIsSet } from 'src/utilities';
import { Constants } from 'src/constants';
import { DateComponent, EmptyStateNoData, EmptyStateFilter } from '..';
import { createTippyWithPlugins } from '@patternfly/react-core/dist/esm/helpers/Popper/DeprecatedTippyTypes';

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

  /*
  private renderNamespacePicker(namespaces) {
    return (
      <div className='namespace-selector-wrapper'>
        <div className='label'>{t`Namespace`}</div>
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
            aria-label={t`Select namespace`}
          >
            {namespaces.map((ns) => (
              <FormSelectOption key={ns.name} label={ns.name} value={ns.name} />
            ))}
          </FormSelect>
        </div>
      </div>
    );
  }*/

  private loadNamespaces(namespace_filter) {
    MyNamespaceAPI.list({ page_size: 100, keywords: namespace_filter })
      .then((result) => {
        this.setState({ namespaces: result.data.data });

        //let namespaces = result.data.data;
        //let namespace = this.props.params.namespace;

        /*if (namespace && namespaces.filter((item) => item.name == namespace).length == 0)
        {
          debugger;
            // append namespace in params to list, so we are able to select it
            MyNamespaceAPI.list({ page_size: 100, keywords: namespace }).then((result) => {

              // filter it again to make sure we are not selecting additional namespaces that 
              // contains the substring of our namespace we want to search
              let new_namespace = result.data.data.filter((item) => item.name == namespace);
              new_namespace = new_namespace[0];

              namespaces.push(new_namespace);
              this.setState({namespaces : namespaces});
            });
        }else
        {
          this.setState({namespaces : namespaces});
        }*/
      })
      .catch((result) => console.log(result));
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
            selections={this.state.namespaces.filter(
              (namespace) => namespace.name == this.props.params.namespace,
            )}
            results={this.state.namespaces}
          />
        </div>
      </div>
    );
  }
}
