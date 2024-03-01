import { t } from '@lingui/macro';
import { Button } from '@patternfly/react-core';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { MyNamespaceAPI, NamespaceAPI, NamespaceListType } from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  HubPagination,
  LinkTabs,
  LoadingPageSpinner,
  LoadingPageWithHeader,
  NamespaceCard,
  NamespaceModal,
  NamespaceNextPageCard,
  closeAlert,
} from 'src/components';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  ParamHelper,
  RouteProps,
  errorMessage,
  filterIsSet,
} from 'src/utilities';
import './namespace-list.scss';

interface IState {
  alerts: AlertType[];
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
}

interface IProps extends RouteProps {
  filterOwner?: boolean;
}

export class NamespaceList extends Component<IProps, IState> {
  static contextType = AppContext;

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
      alerts: [],
      namespaces: undefined,
      itemCount: 0,
      params,
      hasPermission: true,
      isModalOpen: false,
      loading: true,
    };
  }

  private handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
    }));
  };

  componentDidMount() {
    this.setState({ alerts: (this.context as IAppContextType).alerts || [] });
    (this.context as IAppContextType).setAlerts([]);

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
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState(
            {
              namespaces: [],
              itemCount: 0,
              loading: false,
            },
            () =>
              this.addAlert({
                variant: 'danger',
                title: t`Namespaces list could not be displayed.`,
                description: errorMessage(status, statusText),
              }),
          );
        });
    } else {
      this.loadNamespaces();
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const { alerts, namespaces, params, itemCount, loading } = this.state;
    const { filterOwner } = this.props;
    const { hasPermission } = this.context as IAppContextType;

    const noData =
      !filterIsSet(this.state.params, ['keywords']) &&
      namespaces !== undefined &&
      namespaces.length === 0;

    if (loading) {
      return <LoadingPageWithHeader />;
    }

    const updateParams = (p) =>
      this.updateParams(p, () => this.loadNamespaces());

    const filterConfig = [{ id: 'keywords', title: t`keywords` }];

    const sortOptions = [
      { title: t`Name`, id: 'name', type: 'alpha' as const },
    ];

    const buttons = [
      hasPermission('galaxy.add_namespace') ? (
        <Button variant='primary' onClick={this.handleModalToggle}>
          {t`Create`}
        </Button>
      ) : null,
    ];

    const tabs = [
      {
        title: t`All`,
        link: formatPath(Paths.namespaces),
        active: !filterOwner,
      },
      {
        title: t`My namespaces`,
        link: formatPath(Paths.myNamespaces),
        active: filterOwner,
      },
    ];

    return (
      <div className='hub-namespace-page'>
        <NamespaceModal
          isOpen={this.state.isModalOpen}
          toggleModal={this.handleModalToggle}
          onCreateSuccess={(result) =>
            this.setState({
              redirect: formatPath(
                Paths.namespaceDetail,
                {
                  namespace: result.name,
                },
                { tab: 'collections' },
              ),
            })
          }
        />
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <BaseHeader title={IS_INSIGHTS ? t`Partners` : t`Namespaces`}>
          {!(this.context as IAppContextType).user.is_anonymous && (
            <div className='hub-tab-link-container'>
              <div className='tabs'>
                <LinkTabs tabs={tabs} />
              </div>
            </div>
          )}
        </BaseHeader>
        {noData ? null : (
          <HubListToolbar
            buttons={buttons}
            count={itemCount}
            filterConfig={filterConfig}
            ignoredParams={['page', 'page_size', 'sort']}
            params={params}
            sortOptions={sortOptions}
            updateParams={updateParams}
          />
        )}
        <section className='card-area'>
          {this.renderBody({ updateParams })}
        </section>
        {noData || loading ? null : (
          <section className='footer'>
            <HubPagination
              params={params}
              updateParams={updateParams}
              count={itemCount}
            />
          </section>
        )}
      </div>
    );
  }

  private renderBody({ updateParams }) {
    const { itemCount, loading, namespaces, params } = this.state;
    const { filterOwner } = this.props;
    const { hasPermission } = this.context as IAppContextType;

    const noDataTitle = t`No namespaces yet`;
    const noDataDescription = !filterOwner
      ? t`Namespaces will appear once created`
      : t`This account is not set up to manage any namespaces`;

    const noDataButton = hasPermission('galaxy.add_namespace') ? (
      <Button variant='primary' onClick={() => this.handleModalToggle()}>
        {t`Create`}
      </Button>
    ) : null;

    if (loading) {
      return (
        <section>
          <LoadingPageSpinner />;
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
      <section className='hub-card-layout'>
        {namespaces.map((ns, i) => (
          <div key={i} className='card-wrapper'>
            <NamespaceCard showDetailLink key={i} namespace={ns} />
          </div>
        ))}
        {itemCount > params.page_size * (params.page ?? 1) ? (
          <div className='card-wrapper'>
            <NamespaceNextPageCard
              onClick={() =>
                updateParams({ ...params, page: (params.page ?? 1) + 1 })
              }
            />
          </div>
        ) : null}
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
        .catch((e) => {
          const { status, statusText } = e.response;
          this.setState(
            {
              namespaces: [],
              itemCount: 0,
              loading: false,
            },
            () =>
              this.addAlert({
                variant: 'danger',
                title: t`Namespaces list could not be displayed.`,
                description: errorMessage(status, statusText),
              }),
          );
        });
    });
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      ignoreParams: ['tenant'],
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  private closeAlert(index) {
    closeAlert(index, {
      alerts: this.state.alerts,
      setAlerts: (alerts) => this.setState({ alerts }),
    });
  }
}
