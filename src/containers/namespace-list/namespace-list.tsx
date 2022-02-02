import * as React from 'react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { t } from '@lingui/macro';

import { ParamHelper } from 'src/utilities/param-helper';
import {
  AlertList,
  AppliedFilters,
  BaseHeader,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  LinkTabs,
  LoadingPageSpinner,
  LoadingPageWithHeader,
  NamespaceCard,
  NamespaceModal,
  Pagination,
  Sort,
} from 'src/components';
import { NamespaceAPI, NamespaceListType, MyNamespaceAPI } from 'src/api';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { Constants } from 'src/constants';
import { filterIsSet } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';
import { i18n } from '@lingui/core';

import './namespace-list.scss';

interface IState {
  namespaces: NamespaceListType[];
  itemCount: number;
  params: {
    name?: string;
    sort?: string;
    page?: number;
    page_size?: number;
    tenant?: string;
    keywords?: string;
  };
  hasPermission: boolean;
  isModalOpen: boolean;
  loading: boolean;
  redirect?: string;
  inputText: string;
}

interface IProps extends RouteComponentProps {
  namespacePath: Paths;
  filterOwner?: boolean;
}

export class NamespaceList extends React.Component<IProps, IState> {
  nonURLParams = ['tenant'];

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 20;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      namespaces: undefined,
      itemCount: 0,
      params: params,
      hasPermission: true,
      isModalOpen: false,
      loading: true,
      inputText: params['keywords'] || '',
    };
  }

  private handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
    }));
  };

  componentDidMount() {
    if (this.props.filterOwner) {
      // Make a query with no params and see if it returns results to tell
      // if the user can edit namespaces
      MyNamespaceAPI.list({})
        .then((results) => {
          if (results.data.meta.count !== 0) {
            this.loadNamespaces();
          } else {
            this.setState({
              hasPermission: false,
              namespaces: [],
              loading: false,
            });
          }
        })
        .catch((e) =>
          this.setState(
            {
              namespaces: [],
              itemCount: 0,
              loading: false,
            },
            () =>
              this.context.setAlerts([
                ...this.context.alerts,
                {
                  variant: 'danger',
                  title: t`Error loading my namespaces.`,
                  description: e?.message,
                },
              ]),
          ),
        );
    } else {
      this.loadNamespaces();
    }
  }

  componentWillUnmount() {
    this.context.setAlerts([]);
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    const { namespaces, params, itemCount, loading, inputText } = this.state;
    const { filterOwner } = this.props;
    const { user, alerts } = this.context;
    const noData =
      !filterIsSet(this.state.params, ['keywords']) &&
      namespaces !== undefined &&
      namespaces.length === 0;

    if (loading) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    // Namespaces or Partners
    const title = i18n._(namespaceBreadcrumb.name);

    const updateParams = (p) => {
      p['page'] = 1;
      this.updateParams(p, () => this.loadNamespaces());
    };

    return (
      <div className='hub-namespace-page'>
        <NamespaceModal
          isOpen={this.state.isModalOpen}
          toggleModal={this.handleModalToggle}
          onCreateSuccess={(result) =>
            this.setState({
              redirect: formatPath(Paths.myCollections, {
                namespace: result['name'],
              }),
            })
          }
        ></NamespaceModal>
        <AlertList alerts={alerts} closeAlert={() => this.closeAlert()} />
        <BaseHeader title={title}>
          {!this.context.user.is_anonymous && (
            <div className='hub-tab-link-container'>
              <div className='tabs'>
                <LinkTabs
                  tabs={[
                    {
                      title: t`All`,
                      link: Paths[NAMESPACE_TERM],
                      active: !filterOwner,
                    },
                    {
                      title: t`My namespaces`,
                      link: Paths.myNamespaces,
                      active: filterOwner,
                    },
                  ]}
                />
              </div>
            </div>
          )}
          {noData ? null : (
            <div className='toolbar'>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarGroup style={{ marginLeft: 0 }}>
                    <ToolbarItem>
                      <CompoundFilter
                        inputText={inputText}
                        onChange={(text) => this.setState({ inputText: text })}
                        updateParams={updateParams}
                        params={params}
                        filterConfig={[{ id: 'keywords', title: t`keywords` }]}
                      />
                      <AppliedFilters
                        style={{ marginTop: '16px' }}
                        updateParams={updateParams}
                        params={params}
                        ignoredParams={['page_size', 'page', 'sort']}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                  <ToolbarGroup style={{ alignSelf: 'start' }}>
                    <ToolbarItem>
                      <Sort
                        options={[
                          { title: t`Name`, id: 'name', type: 'alpha' },
                        ]}
                        params={params}
                        updateParams={updateParams}
                      />
                    </ToolbarItem>
                    {user?.model_permissions?.add_namespace && (
                      <ToolbarItem key='create-button'>
                        <Button
                          variant='primary'
                          onClick={this.handleModalToggle}
                        >
                          {t`Create`}
                        </Button>
                      </ToolbarItem>
                    )}
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>
              <div>
                <Pagination
                  params={params}
                  updateParams={(p) =>
                    this.updateParams(p, () => this.loadNamespaces())
                  }
                  count={itemCount}
                  isCompact
                  perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
                />
              </div>
            </div>
          )}
        </BaseHeader>
        <section className='card-area'>{this.renderBody()}</section>
        {noData || loading ? null : (
          <section className='footer'>
            <Pagination
              params={params}
              updateParams={(p) =>
                this.updateParams(p, () => this.loadNamespaces())
              }
              perPageOptions={Constants.CARD_DEFAULT_PAGINATION_OPTIONS}
              count={itemCount}
            />
          </section>
        )}
      </div>
    );
  }

  private renderBody() {
    const { namespaces, loading } = this.state;
    const { namespacePath, filterOwner } = this.props;
    const { user } = this.context;

    const noDataTitle = t`No namespaces yet`;
    const noDataDescription = !filterOwner
      ? t`Namespaces will appear once created`
      : t`This account is not set up to manage any namespaces`;

    const noDataButton = user?.model_permissions?.add_namespace ? (
      <Button variant='primary' onClick={() => this.handleModalToggle()}>
        {t`Create`}
      </Button>
    ) : null;

    if (loading) {
      return (
        <section>
          <LoadingPageSpinner></LoadingPageSpinner>;
        </section>
      );
    }

    if (namespaces.length === 0) {
      return (
        <section>
          {filterIsSet(this.state.params, ['keywords']) ? (
            <EmptyStateFilter />
          ) : (
            <EmptyStateNoData
              title={noDataTitle}
              description={noDataDescription}
              button={noDataButton}
            />
          )}
        </section>
      );
    }

    return (
      <section className='card-layout'>
        {namespaces.map((ns, i) => (
          <div key={i} className='card-wrapper'>
            <NamespaceCard
              namespaceURL={formatPath(namespacePath, {
                namespace: ns.name,
                repo: this.context.selectedRepo,
              })}
              key={i}
              {...ns}
            ></NamespaceCard>
          </div>
        ))}
      </section>
    );
  }

  private loadNamespaces() {
    const { filterOwner } = this.props;
    const api = filterOwner ? MyNamespaceAPI : NamespaceAPI;

    this.setState({ loading: true }, () => {
      api
        .list(this.state.params)
        .then((results) => {
          this.setState({
            namespaces: results.data.data,
            itemCount: results.data.meta.count,
            loading: false,
          });
        })
        .catch((e) =>
          this.setState(
            {
              namespaces: [],
              itemCount: 0,
              loading: false,
            },
            () =>
              this.context.setAlerts([
                ...this.context.alerts,
                {
                  variant: 'danger',
                  title: t`Error loading namespaces.`,
                  description: e?.message,
                },
              ]),
          ),
        );
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonURLParams);
  }

  private closeAlert() {
    this.context.setAlerts([]);
  }
}

NamespaceList.contextType = AppContext;
