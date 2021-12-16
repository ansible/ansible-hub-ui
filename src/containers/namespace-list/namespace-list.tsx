import { t } from '@lingui/macro';
import * as React from 'react';
import './namespace-list.scss';

import { RouteComponentProps, Redirect } from 'react-router-dom';

import { ParamHelper } from 'src/utilities/param-helper';
import {
  BaseHeader,
  EmptyStateFilter,
  EmptyStateNoData,
  EmptyStateUnauthorized,
  LinkTabs,
  LoadingPageSpinner,
  LoadingPageWithHeader,
  NamespaceCard,
  NamespaceModal,
  Pagination,
  Toolbar,
  AlertList,
} from 'src/components';
import { Button, ToolbarItem } from '@patternfly/react-core';
import { NamespaceAPI, NamespaceListType, MyNamespaceAPI } from 'src/api';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { Constants } from 'src/constants';
import { filterIsSet } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';

interface IState {
  namespaces: NamespaceListType[];
  itemCount: number;
  params: {
    name?: string;
    sort?: string;
    page?: number;
    page_size?: number;
    tenant?: string;
  };
  hasPermission: boolean;
  isModalOpen: boolean;
  loading: boolean;
  redirect?: string;
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
      MyNamespaceAPI.list({}).then((results) => {
        if (results.data.meta.count !== 0) {
          this.loadNamespaces();
        } else {
          this.setState({
            hasPermission: false,
            namespaces: [],
            loading: false,
          });
        }
      });
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

    const { namespaces, params, itemCount, loading } = this.state;
    const { filterOwner } = this.props;
    const { user, alerts } = this.context;
    const noData =
      !filterIsSet(this.state.params, ['keywords']) &&
      namespaces !== undefined &&
      namespaces.length === 0;

    if (loading) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    let extra = [];

    if (user?.model_permissions?.add_namespace) {
      extra.push(
        <ToolbarItem key='create-button'>
          <Button variant='primary' onClick={this.handleModalToggle}>
            {t`Create`}
          </Button>
        </ToolbarItem>,
      );
    }

    const title = namespaceBreadcrumb.name;
    const titleLowerCase = title.toLowerCase();
    const search = filterOwner
      ? t`Search my namespaces`
      : t`Search all ${titleLowerCase}`;

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
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
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
              <Toolbar
                params={params}
                sortOptions={[{ title: t`Name`, id: 'name', type: 'alpha' }]}
                searchPlaceholder={search}
                updateParams={(p) =>
                  this.updateParams(p, () => this.loadNamespaces())
                }
                extraInputs={extra}
              />
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
    let apiFunc: any;

    if (this.props.filterOwner) {
      apiFunc = (p) => MyNamespaceAPI.list(p);
    } else {
      apiFunc = (p) => NamespaceAPI.list(p);
    }
    this.setState({ loading: true }, () => {
      apiFunc(this.state.params).then((results) => {
        this.setState({
          namespaces: results.data.data,
          itemCount: results.data.meta.count,
          loading: false,
        });
      });
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonURLParams);
  }

  private closeAlert(i) {
    this.context.setAlerts([]);
  }
}

NamespaceList.contextType = AppContext;
