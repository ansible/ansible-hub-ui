import { t } from '@lingui/macro';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { Component } from 'react';
import { SigningServiceAPI, type SigningServiceType } from 'src/api';
import {
  AlertList,
  type AlertType,
  AppliedFilters,
  BaseHeader,
  ClipboardCopy,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  HubPagination,
  ListItemActions,
  LoadingSpinner,
  Main,
  SortTable,
  closeAlert,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import {
  ParamHelper,
  type RouteProps,
  errorMessage,
  filterIsSet,
  withRouter,
} from 'src/utilities';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: SigningServiceType[];
  itemCount: number;
  alerts: AlertType[];
  unauthorized: boolean;
  inputText: string;
}

export class SignatureKeysList extends Component<RouteProps, IState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 100;
    }

    this.state = {
      params,
      items: [],
      loading: true,
      itemCount: 0,
      alerts: [],
      unauthorized: false,
      inputText: '',
    };
  }

  componentDidMount() {
    if (
      !(this.context as IAppContextType).user ||
      (this.context as IAppContextType).user.is_anonymous
    ) {
      this.setState({ loading: false, unauthorized: true });
    } else {
      this.query();
    }
  }

  render() {
    const { params, itemCount, loading, items, alerts, unauthorized } =
      this.state;

    const noData = items.length === 0 && !filterIsSet(params, ['name']);

    return (
      <>
        <AlertList
          alerts={alerts}
          closeAlert={(i) =>
            closeAlert(i, {
              alerts,
              setAlerts: (alerts) => this.setState({ alerts }),
            })
          }
        />
        <BaseHeader title={t`Signature keys`} />
        {unauthorized ? (
          <EmptyStateUnauthorized />
        ) : noData && !loading ? (
          <EmptyStateNoData
            title={t`No signature keys yet`}
            description={t`Signature keys will appear once created.`}
          />
        ) : (
          <Main>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <section className='body'>
                <div className='hub-toolbar'>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <CompoundFilter
                            inputText={this.state.inputText}
                            onChange={(text) =>
                              this.setState({ inputText: text })
                            }
                            updateParams={(p) => {
                              p['page'] = 1;
                              this.updateParams(p, () => this.query());
                            }}
                            params={params}
                            filterConfig={[
                              {
                                id: 'name',
                                title: t`Name`,
                              },
                            ]}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarContent>
                  </Toolbar>
                  <HubPagination
                    params={params}
                    updateParams={(p) =>
                      this.updateParams(p, () => this.query())
                    }
                    count={itemCount}
                    isTop
                  />
                </div>
                <div>
                  <AppliedFilters
                    updateParams={(p) => {
                      this.updateParams(p, () => this.query());
                      this.setState({ inputText: '' });
                    }}
                    params={params}
                    ignoredParams={['page_size', 'page', 'sort', 'ordering']}
                    niceNames={{
                      name: t`Name`,
                    }}
                  />
                </div>
                {loading ? <LoadingSpinner /> : this.renderTable(params)}

                <HubPagination
                  params={params}
                  updateParams={(p) => this.updateParams(p, () => this.query())}
                  count={itemCount}
                />
              </section>
            )}
          </Main>
        )}
      </>
    );
  }

  private renderTable(params) {
    const { items } = this.state;
    if (!items.length) {
      return <EmptyStateFilter />;
    }

    const sortTableOptions = {
      headers: [
        {
          title: t`Name`,
          type: 'none',
          id: 'name',
        },
        {
          title: t`Key fingerprint`,
          type: 'none',
          id: 'pubkey_fingerprint',
        },
        {
          title: t`Created on`,
          type: 'none',
          id: 'pulp_created',
        },
        {
          title: t`Public key`,
          type: 'none',
          id: 'public_key',
        },
        {
          title: '',
          type: 'none',
          id: 'kebab',
        },
      ],
    };

    return (
      <Table aria-label={t`Signature keys`}>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => {
            p['page'] = 1;
            this.updateParams(p, () => this.query());
          }}
        />
        <Tbody>{items.map((item, i) => this.renderTableRow(item, i))}</Tbody>
      </Table>
    );
  }

  private renderTableRow(item, index: number) {
    const { name, pubkey_fingerprint, public_key, pulp_created } = item;

    const dropdownItems = [
      <DropdownItem
        key='download-key'
        onClick={() => {
          document.location =
            'data:application/octet-stream,' + encodeURIComponent(public_key);
        }}
      >
        {t`Download key`}
      </DropdownItem>,
    ];

    return (
      <Tr key={index}>
        <Td>{name}</Td>
        <Td data-cy='hub-signature-list-fingerprint'>{pubkey_fingerprint}</Td>
        <Td>
          <DateComponent date={pulp_created} />
        </Td>
        <Td>
          <ClipboardCopy isCode isReadOnly variant={'expansion'}>
            {public_key}
          </ClipboardCopy>
        </Td>
        <ListItemActions kebabItems={dropdownItems} />
      </Tr>
    );
  }

  private query() {
    this.setState({ loading: true }, () => {
      SigningServiceAPI.list({ sort: 'name', ...this.state.params })
        .then((result) => {
          this.setState({
            items: result.data.results,
            itemCount: result.data.count,
            loading: false,
          });
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState({
            loading: false,
            items: [],
            itemCount: 0,
          });
          this.addAlert({
            title: t`Signature keys could not be displayed.`,
            variant: 'danger',
            description: errorMessage(status, statusText),
          });
        });
    });
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }
}

export default withRouter(SignatureKeysList);
