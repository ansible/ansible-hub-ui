import * as React from 'react';
import * as moment from 'moment';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { ExecutionEnvironmentAPI } from '../../api';
import { ParamHelper } from '../../utilities';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import {
  CompoundFilter,
  LoadingPageSpinner,
  AppliedFilters,
  Pagination,
  SortTable,
  AlertList,
  closeAlertMixin,
  AlertType,
  BaseHeader,
  Main,
} from '../../components';

interface IState {
  params: {
    page?: number;
    page_size?: number;
  };
  loading: boolean;
  items: any[];
  itemCount: number;
  alerts: AlertType[];
}

class ExecutionEnvironmentList extends React.Component<
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
      params['page_size'] = 10;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      params: params,
      items: [],
      loading: true,
      itemCount: 0,
      alerts: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.list(this.state.params).then(result => {
        this.setState({
          items: result.data.results,
          itemCount: result.data.count,
          loading: false,
        });
      }),
    );
  }

  render() {
    const { params, itemCount, loading, alerts } = this.state;

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={i => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title='Container Registry'></BaseHeader>
        <Main>
          <Section className='body'>
            <div className='toolbar'>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <CompoundFilter
                        updateParams={p =>
                          this.updateParams(p, () => this.queryEnvironments())
                        }
                        params={params}
                        filterConfig={[
                          {
                            id: 'name',
                            title: 'Container repository name',
                          },
                        ]}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>

              <Pagination
                params={params}
                updateParams={p =>
                  this.updateParams(p, () => this.queryEnvironments())
                }
                count={itemCount}
                isTop
              />
            </div>
            <div>
              <AppliedFilters
                updateParams={p =>
                  this.updateParams(p, () => this.queryEnvironments())
                }
                params={params}
                ignoredParams={['page_size', 'page', 'sort']}
              />
            </div>
            {loading ? <LoadingPageSpinner /> : this.renderTable(params)}

            <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
              <Pagination
                params={params}
                updateParams={p =>
                  this.updateParams(p, () => this.queryEnvironments())
                }
                count={itemCount}
              />
            </div>
          </Section>
        </Main>
      </React.Fragment>
    );
  }

  private renderTable(params) {
    debugger;
    const { items } = this.state;
    if (items.length === 0) {
      return (
        <EmptyState className='empty' variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={WarningTriangleIcon} />
          <Title headingLevel='h2' size='lg'>
            No matches
          </Title>
          <EmptyStateBody>
            Please try adjusting your search query.
          </EmptyStateBody>
        </EmptyState>
      );
    }

    let sortTableOptions = {
      headers: [
        {
          title: 'Container repository name',
          type: 'alpha',
          id: 'name',
        },
        {
          title: 'Description',
          type: 'alpha',
          id: 'description',
        },
        {
          title: 'Created',
          type: 'numeric',
          id: 'pulp_created',
        },
      ],
    };

    return (
      <table aria-label='User list' className='content-table pf-c-table'>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={p =>
            this.updateParams(p, () => this.queryEnvironments())
          }
        />
        <tbody>{items.map((user, i) => this.renderTableRow(user, i))}</tbody>
      </table>
    );
  }

  private renderTableRow(item: any, index: number) {
    return (
      <tr aria-labelledby={item.name} key={index}>
        <td>{item.name}</td>
        <td>{item.description}</td>
        <td>{moment(item.pulp_created).fromNow()}</td>
      </tr>
    );
  }

  private queryEnvironments() {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.list(this.state.params).then(result =>
        this.setState({
          items: result.data.results,
          itemCount: result.data.count,
          loading: false,
        }),
      ),
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(ExecutionEnvironmentList);
