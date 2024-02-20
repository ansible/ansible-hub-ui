import { t } from '@lingui/macro';
import { DataList, DropdownItem } from '@patternfly/react-core';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  LegacyNamespaceAPI,
  LegacyNamespaceListType,
  LegacyRoleAPI,
  LegacyRoleListType,
  TagAPI,
} from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  EmptyStateFilter,
  EmptyStateNoData,
  HubListToolbar,
  HubPagination,
  LegacyRoleListItem,
  LoadingPageSpinner,
  Logo,
  ProviderLink,
  RoleNamespaceEditModal,
  StatefulDropdown,
  WisdomModal,
  closeAlertMixin,
} from 'src/components';
import { NotFound } from 'src/containers/not-found/not-found';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  ParamHelper,
  RouteProps,
  filterIsSet,
  getProviderInfo,
  handleHttpError,
  withRouter,
} from 'src/utilities';

interface NamespaceRolesProps {
  addAlert: (alert: AlertType) => void;
  location: RouteProps['location'];
  namespace: LegacyNamespaceListType;
  navigate: RouteProps['navigate'];
}

interface NamespaceRolesState {
  count: number;
  loading: boolean;
  params: {
    keywords?: string;
    page?: number;
    page_size?: number;
    sort?: string;
    tags?: string[];
  };
  roles: LegacyRoleListType[];
}

class NamespaceRoles extends Component<
  NamespaceRolesProps,
  NamespaceRolesState
> {
  // This is the list of roles that is shown on
  // the legacy namespace details page.

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    this.state = {
      count: 0,
      loading: true,
      params: {
        page: 1,
        page_size: 10,
        sort: '-created',
        ...params,
      },
      roles: [],
    };
  }

  componentDidMount() {
    this.query(this.state.params);
  }

  query(params) {
    const { addAlert, namespace } = this.props;

    this.setState({ loading: true });
    LegacyRoleAPI.list({
      ...params,
      namespace: namespace.name,
    })
      .then(({ data: { count, results } }) =>
        this.setState({
          count,
          loading: false,
          roles: results,
        }),
      )
      .catch(
        handleHttpError(
          t`Failed to load roles`,
          () => this.setState({ loading: false }),
          addAlert,
        ),
      );
  }

  loadTags(inputText) {
    return TagAPI.listRoles({ name__icontains: inputText, sort: '-count' })
      .then(({ data: { data } }) =>
        data.map(({ name, count }) => ({
          id: name,
          title: count === undefined ? name : t`${name} (${count})`,
        })),
      )
      .catch(() => []);
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  render() {
    const { count, loading, params, roles } = this.state;

    const updateParams = (params) =>
      this.updateParams(params, () => this.query(params));

    const filterConfig = [
      {
        id: 'keywords',
        title: t`Keywords`,
      },
      {
        id: 'tags',
        title: t`Tags`,
        inputType: 'typeahead' as const,
        // options handled by `typeaheads`
      },
    ];

    const sortOptions = [
      { title: t`Name`, id: 'name', type: 'alpha' as const },
      {
        title: t`Download count`,
        id: 'download_count',
        type: 'numeric' as const,
      },
      {
        title: t`Created`,
        id: 'created',
        type: 'numeric' as const,
      },
    ];

    const noData =
      count === 0 &&
      !filterIsSet(
        params,
        filterConfig.map(({ id }) => id),
      );

    return (
      <div>
        {loading ? (
          <LoadingPageSpinner />
        ) : noData ? (
          <EmptyStateNoData
            title={t`No roles yet`}
            description={t`Roles will appear once imported`}
          />
        ) : (
          <div>
            <HubListToolbar
              count={count}
              filterConfig={filterConfig}
              ignoredParams={['page', 'page_size', 'sort']}
              params={params}
              sortOptions={sortOptions}
              typeaheads={{ tags: this.loadTags }}
              updateParams={updateParams}
            />
            {!count ? (
              <EmptyStateFilter />
            ) : (
              <div>
                <DataList aria-label={t`List of roles`}>
                  {roles &&
                    roles.map((lrole) => (
                      <LegacyRoleListItem key={lrole.id} role={lrole} />
                    ))}
                </DataList>

                <HubPagination
                  count={count}
                  params={params}
                  updateParams={updateParams}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

interface RoleNamespaceState {
  alerts: AlertType[];
  editModal: boolean;
  lightspeedModal: boolean;
  loading: boolean;
  namespace: LegacyNamespaceListType;
}

class AnsibleRoleNamespaceDetail extends Component<
  RouteProps,
  RoleNamespaceState
> {
  static contextType = AppContext;

  // This is the details page for a standalone namespace

  constructor(props) {
    super(props);

    this.state = {
      alerts: [],
      editModal: false,
      lightspeedModal: false,
      loading: true,
      namespace: null,
    };
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  get closeAlert() {
    return closeAlertMixin('alerts');
  }

  componentDidMount() {
    LegacyNamespaceAPI.get(this.props.routeParams.namespaceid)
      .then((response) =>
        this.setState({
          loading: false,
          namespace: response.data,
        }),
      )
      .catch(
        handleHttpError(
          t`Failed to load role namespace`,
          () => this.setState({ loading: false }),
          (alert) => this.addAlert(alert),
        ),
      );
  }

  render() {
    const { alerts, editModal, lightspeedModal, loading, namespace } =
      this.state;
    const {
      featureFlags: { ai_deny_index },
      user: { is_superuser, username },
    } = this.context;
    const { location, navigate } = this.props;

    if (loading) {
      return <LoadingPageSpinner />;
    }

    if (!namespace) {
      return (
        <>
          <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
          <NotFound />
        </>
      );
    }

    const namespace_url = formatPath(Paths.standaloneNamespace, {
      namespaceid: namespace.id,
    });

    const provider = getProviderInfo(namespace);

    const userOwnsLegacyNamespace = !!namespace.summary_fields?.owners?.find(
      (n) => n.username == username,
    );
    const showWisdom =
      ai_deny_index && (is_superuser || userOwnsLegacyNamespace);
    const canImport = is_superuser || userOwnsLegacyNamespace;

    const dropdownItems = [
      showWisdom && (
        <DropdownItem
          onClick={() => this.setState({ lightspeedModal: true })}
        >{t`Ansible Lightspeed settings`}</DropdownItem>
      ),
      is_superuser && (
        <DropdownItem
          onClick={() => this.setState({ editModal: true })}
        >{t`Change provider namespace`}</DropdownItem>
      ),
      canImport && (
        <DropdownItem
          onClick={() =>
            navigate(
              formatPath(
                Paths.standaloneRoleImport,
                {},
                {
                  github_user: namespace.name,
                  back: location.pathname,
                },
              ),
            )
          }
        >{t`Import role`}</DropdownItem>
      ),
    ].filter(Boolean);

    return (
      <>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <BaseHeader
          logo={
            <span>
              <Logo
                alt='avatar url'
                fallbackToDefault
                image={namespace.avatar_url}
                size='90px'
                unlockWidth
                width='90px'
              />
              <Link to={namespace_url}>{namespace.name}</Link>
              <ProviderLink {...provider} />
            </span>
          }
          title={namespace.name}
          pageControls={
            dropdownItems.length && (
              <div style={{ marginTop: '70px' }}>
                <StatefulDropdown items={dropdownItems} />
              </div>
            )
          }
        />

        {lightspeedModal && (
          <WisdomModal
            addAlert={(alert) => this.addAlert(alert)}
            closeAction={() => this.setState({ lightspeedModal: false })}
            reference={namespace.name}
            scope={'legacy_namespace'}
          />
        )}
        {editModal && (
          <RoleNamespaceEditModal
            addAlert={(alert) => this.addAlert(alert)}
            closeAction={() => this.setState({ editModal: false })}
            namespace={namespace}
          />
        )}

        <NamespaceRoles
          addAlert={(alert) => this.addAlert(alert)}
          namespace={namespace}
          location={location}
          navigate={navigate}
        />
      </>
    );
  }
}

export default withRouter(AnsibleRoleNamespaceDetail);
