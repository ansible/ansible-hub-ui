import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ParamHelper, filterIsSet, errorMessage } from '../../utilities';
import {
  AlertList,
  AlertType,
  AppliedFilters,
  BaseHeader,
  ClipboardCopy,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  ListItemActions,
  LoadingPageSpinner,
  Main,
  Pagination,
  SortTable,
  closeAlertMixin,
} from 'src/components';
import { SigningServiceAPI, SigningServiceType } from 'src/api';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: SigningServiceType[];
  itemCount: number;
  alerts: AlertType[];
  unauthorised: boolean;
  inputText: string;
}

export class SignatureKeysList extends React.Component<
  RouteComponentProps,
  IState
> {
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
      params: params,
      items: [],
      loading: true,
      itemCount: 0,
      alerts: [],
      unauthorised: false,
      inputText: '',
    };
  }

  componentDidMount() {
    if (!this.context.user || this.context.user.is_anonymous) {
      this.setState({ loading: false, unauthorised: true });
    } else {
      this.query();
    }
  }

  render() {
    const { params, itemCount, loading, items, alerts, unauthorised } =
      this.state;

    const noData = items.length === 0 && !filterIsSet(params, ['name']);

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title={t`Signature Keys`} />
        {unauthorised ? (
          <EmptyStateUnauthorized />
        ) : noData && !loading ? (
          <EmptyStateNoData
            title={t`No signature keys yet`}
            description={t`Signature keys will appear once created.`}
          />
        ) : (
          <Main>
            {loading ? (
              <LoadingPageSpinner />
            ) : (
              <section className='body'>
                <div className='hub-list-toolbar'>
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
                  <Pagination
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
                {loading ? <LoadingPageSpinner /> : this.renderTable(params)}

                <Pagination
                  params={params}
                  updateParams={(p) => this.updateParams(p, () => this.query())}
                  count={itemCount}
                />
              </section>
            )}
          </Main>
        )}
      </React.Fragment>
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
      <table
        aria-label={t`Signature keys`}
        className='hub-c-table-content pf-c-table'
      >
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(p) => {
            p['page'] = 1;
            this.updateParams(p, () => this.query());
          }}
        />
        <tbody>{items.map((item, i) => this.renderTableRow(item, i))}</tbody>
      </table>
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
      <tr key={index}>
        <td>{name}</td>
        <td>{pubkey_fingerprint}</td>
        <td>
          <DateComponent date={pulp_created} />
        </td>
        <td>
          <ClipboardCopy isCode isReadOnly variant={'expansion'}>
            {public_key}
          </ClipboardCopy>
        </td>
        <ListItemActions kebabItems={dropdownItems} />
      </tr>
    );
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private query() {
    this.setState({ loading: true }, () => {
      SigningServiceAPI.list(this.state.params)
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

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(SignatureKeysList);

SignatureKeysList.contextType = AppContext;
