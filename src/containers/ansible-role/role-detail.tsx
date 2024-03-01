import { Trans, t } from '@lingui/macro';
import {
  Button,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemRow,
  Nav,
  NavItem,
  NavList,
  Panel,
} from '@patternfly/react-core';
import DownloadIcon from '@patternfly/react-icons/dist/esm/icons/download-icon';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  LegacyImportAPI,
  LegacyNamespaceAPI,
  LegacyNamespaceDetailType,
  LegacyRoleAPI,
  LegacyRoleDetailType,
  LegacyRoleImportDetailType,
  LegacyRoleVersionDetailType,
} from 'src/api';
import { EmptyStateNoData } from 'src/components';
import {
  AlertList,
  AlertType,
  BaseHeader,
  Breadcrumbs,
  ClipboardCopy,
  DateComponent,
  DownloadCount,
  ExternalLink,
  ImportConsole,
  LabelGroup,
  LoadingPageWithHeader,
  Logo,
  Main,
  RoleRatings,
  Tag,
  closeAlert,
} from 'src/components';
import { NotFound } from 'src/containers/not-found/not-found';
import { AppContext, IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { RouteProps, handleHttpError, withRouter } from 'src/utilities';

const DownloadLink = ({ href, text }: { href: string; text: string }) => (
  <ExternalLink href={href} variant='download'>
    <DownloadIcon /> {text}
  </ExternalLink>
);

interface RoleMetaProps {
  addAlert: (alert: AlertType) => void;
  name: string;
  namespace: string;
  role: LegacyRoleDetailType;
}

interface RoleMetaReadmeState {
  readme_html: string;
}

class RoleInstall extends Component<RoleMetaProps> {
  render() {
    const installCMD = `ansible-galaxy role install ${this.props.namespace}.${this.props.name}`;
    return (
      <>
        <h1>
          <Trans>Installation:</Trans>
        </h1>
        <ClipboardCopy isCode isReadOnly variant={'expansion'}>
          {installCMD}
        </ClipboardCopy>
      </>
    );
  }
}

class RoleDocs extends Component<RoleMetaProps, RoleMetaReadmeState> {
  constructor(props) {
    super(props);
    this.state = {
      readme_html: null,
    };
  }

  componentDidMount() {
    LegacyRoleAPI.getContent(this.props.role.id)
      .then(({ data: { readme_html } }) =>
        this.setState({
          readme_html,
        }),
      )
      .catch(
        handleHttpError(
          t`Failed to load role content`,
          () => null,
          this.props.addAlert,
        ),
      );
  }

  render() {
    return (
      <div>
        <div
          className='pf-v5-c-content'
          dangerouslySetInnerHTML={{ __html: this.state.readme_html }}
        />
      </div>
    );
  }
}

interface RoleVersionProps {
  role_version: LegacyRoleVersionDetailType;
}

class RoleVersion extends Component<RoleVersionProps> {
  render() {
    return (
      <DataListItemRow>
        <DataListCell alignRight>{this.props.role_version.name}</DataListCell>

        <DataListCell alignRight>
          <Trans>
            Released <DateComponent date={this.props.role_version.created} />
          </Trans>
        </DataListCell>

        {/* Release tarballs hosted on github */}
        <DataListCell alignRight>
          <DownloadLink
            href={this.props.role_version.download_url}
            text={t`Download ${this.props.role_version.name} tarball`}
          />
        </DataListCell>
      </DataListItemRow>
    );
  }
}

interface RoleVersionsState {
  role_versions: LegacyRoleVersionDetailType[];
  loading: boolean;
}

interface RoleVersionsProps extends RoleMetaProps {
  repository: string;
}

class RoleVersions extends Component<RoleVersionsProps, RoleVersionsState> {
  constructor(props) {
    super(props);
    this.state = {
      role_versions: [],
      loading: true,
    };
  }

  componentDidMount() {
    LegacyRoleAPI.getVersions(this.props.role.id)
      .then(({ data: { results } }) =>
        this.setState({
          role_versions: results,
          loading: false,
        }),
      )
      .catch(
        handleHttpError(
          t`Failed to load role versions`,
          () => this.setState({ loading: false }),
          this.props.addAlert,
        ),
      );
  }

  render() {
    const {
      repository,
      role: { github_branch },
    } = this.props;
    const { loading, role_versions } = this.state;

    return (
      <div>
        {!loading && role_versions && role_versions.length == 0 ? (
          <EmptyStateNoData
            title={t`No versions`}
            description={t`The role is versionless and will always install from the ${github_branch} branch.`}
            button={
              <DownloadLink
                href={`${repository}/archive/${encodeURIComponent(
                  github_branch,
                )}.zip`}
                text={t`Download latest tarball`}
              />
            }
          />
        ) : null}

        <DataList aria-label={t`List of versions`}>
          {role_versions.reverse().map((rversion) => (
            <DataListItem key={rversion.name}>
              <RoleVersion role_version={rversion} />
            </DataListItem>
          ))}
        </DataList>
      </div>
    );
  }
}

interface RoleImportDetailProps {
  addAlert: (alert: AlertType) => void;
  role: LegacyRoleDetailType;
}

interface RoleImportDetailState {
  lastImport: LegacyRoleImportDetailType;
  loading: boolean;
}

class RoleImportLog extends Component<
  RoleImportDetailProps,
  RoleImportDetailState
> {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      lastImport: null,
    };
  }

  componentDidMount() {
    const { addAlert, role } = this.props;
    this.setState({ loading: true, lastImport: null });

    LegacyImportAPI.list({
      detail: true,
      page_size: 1,
      role_id: role.id,
      sort: '-created',
      state: 'SUCCESS',
    })
      .then(
        ({
          data: {
            results: [lastImport],
          },
        }) =>
          this.setState({
            lastImport,
            loading: false,
          }),
      )
      .catch(
        handleHttpError(
          t`Failed to get import log`,
          () => this.setState({ loading: false, lastImport: null }),
          addAlert,
        ),
      );
  }

  render() {
    const { role } = this.props;
    const { lastImport, loading } = this.state;

    return (
      <>
        {!loading && !lastImport ? (
          <EmptyStateNoData
            title={t`No import logs for role id ${role.id}`}
            description={t`No import logs were found for the role.`}
          />
        ) : null}

        {lastImport && (
          <ImportConsole loading={loading} roleImport={lastImport} />
        )}
      </>
    );
  }
}

interface RoleState {
  activeItem: string;
  alerts: AlertType[];
  fullNamespace: LegacyNamespaceDetailType;
  loading: boolean;
  name: string;
  namespace: string;
  role: LegacyRoleDetailType;
}

class AnsibleRoleDetail extends Component<RouteProps, RoleState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    const { namespace, name, tab } = props.routeParams;
    this.state = {
      activeItem: tab || 'install',
      alerts: [],
      loading: true,
      name,
      namespace,
      fullNamespace: null,
      role: null,
    };
  }

  componentDidMount() {
    const { name, namespace } = this.state;

    LegacyRoleAPI.list({
      name,
      namespace,
      page_size: 1,
    })
      .then(
        ({
          data: {
            results: [role],
          },
        }) => {
          this.setState({ role, loading: false });

          const namespace = role?.summary_fields?.namespace;
          if (namespace?.id) {
            return LegacyNamespaceAPI.get(namespace.id).then(
              ({ data: fullNamespace }) => this.setState({ fullNamespace }),
            );
          }
        },
      )
      .catch(
        handleHttpError(
          t`Failed to find role`,
          () => this.setState({ loading: false }),
          (alert) => this.addAlert(alert),
        ),
      );
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  render() {
    const { activeItem, alerts, fullNamespace, loading, name, role } =
      this.state;
    const {
      user: { username, is_superuser },
    } = this.context as IAppContextType;

    if (loading) {
      return <LoadingPageWithHeader />;
    }

    if (!role) {
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
          <NotFound />
        </>
      );
    }

    const repository =
      'https://github.com/' +
      encodeURIComponent(role.github_user) +
      '/' +
      encodeURIComponent(role.github_repo);
    const namespace = role.summary_fields.namespace;
    const namespace_url = formatPath(Paths.standaloneNamespace, {
      namespaceid: namespace.id,
    });
    let release_date = null;
    let release_name = null;
    const last_version = role.summary_fields.versions[0];
    if (last_version) {
      release_date = last_version.release_date;
      release_name = last_version.name;
    }
    if (!release_date) {
      release_date = role.modified;
    }
    if (!release_name) {
      release_name = '';
    }

    const tabs = {
      install: t`Install`,
      documentation: t`Documentation`,
      versions: t`Versions`,
      import_log: t`Import log`,
    };

    const addAlert = (alert) => this.addAlert(alert);

    const renderContent = () => {
      if (activeItem == 'install') {
        return (
          <RoleInstall
            addAlert={addAlert}
            name={name}
            namespace={namespace.name}
            role={role}
          />
        );
      } else if (activeItem === 'documentation') {
        return (
          <RoleDocs
            addAlert={addAlert}
            name={name}
            namespace={namespace.name}
            role={role}
          />
        );
      } else if (activeItem === 'versions') {
        return (
          <RoleVersions
            addAlert={addAlert}
            name={name}
            namespace={namespace.name}
            repository={repository}
            role={role}
          />
        );
      } else if (activeItem === 'import_log') {
        return <RoleImportLog addAlert={addAlert} role={role} />;
      } else {
        return <div />;
      }
    };

    const breadcrumbs = [
      {
        name: t`Roles`,
        url: formatPath(Paths.standaloneRoles),
      },
      {
        name: namespace.name,
        url: formatPath(Paths.standaloneNamespace, {
          namespaceid: namespace.id,
        }),
      },
      {
        name,
        url: formatPath(Paths.standaloneRole, {
          namespace: namespace.name,
          name,
        }),
      },
      { name: tabs[activeItem || 'install'] },
    ];

    const onTabSelect = (newTab) => {
      this.setState({ activeItem: newTab });

      this.props.navigate(
        formatPath(Paths.standaloneRole, {
          namespace: namespace.name,
          name,
          tab: newTab,
        }),
      );
    };

    const canImport =
      is_superuser ||
      !!fullNamespace?.summary_fields?.owners?.find(
        (n) => n.username == username,
      );

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
        <BaseHeader
          breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
          title={`${namespace.name}.${role.name}`}
          subTitle={
            <>
              <div className='hub-entry'>{role.description}</div>
              <div className='hub-entry'>
                <LabelGroup>
                  {role.summary_fields.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </LabelGroup>
              </div>
            </>
          }
          logo={
            <span>
              <Logo
                alt={t`${namespace.name} logo`}
                fallbackToDefault
                image={role.summary_fields.namespace.avatar_url}
                size='70px'
                unlockWidth
                width='97px'
              />
              <Link to={namespace_url}>{namespace.name}</Link>
            </span>
          }
          pageControls={
            <div>
              <div className='hub-right-col hub-entry'>
                <Trans>
                  Updated <DateComponent date={release_date} />
                </Trans>
              </div>
              {release_name && <div className='hub-entry'>{release_name}</div>}
              <div className='hub-entry'>
                <ExternalLink
                  href={repository}
                >{t`GitHub Repository`}</ExternalLink>
              </div>
              <div className='hub-entry'>
                <RoleRatings namespace={namespace.name} name={role.name} />
                <DownloadCount item={role} />
              </div>
              {canImport && (
                <Button
                  key='import'
                  onClick={() =>
                    this.props.navigate(
                      formatPath(
                        Paths.standaloneRoleImport,
                        {},
                        {
                          github_user: role.github_user,
                          github_repo: role.github_repo,
                          github_branch: role.github_branch,
                          back: this.props.location.pathname,
                        },
                      ),
                    )
                  }
                >{t`Import new version`}</Button>
              )}
            </div>
          }
        >
          {/* FIXME: replace with LinkTabs */}
          <Panel isScrollable>
            <Nav
              theme='light'
              variant='tertiary'
              onSelect={(_event, { itemId }) => onTabSelect(itemId)}
            >
              <NavList>
                {Object.keys(tabs).map((key) => {
                  return (
                    <NavItem
                      isActive={activeItem === key}
                      title={tabs[key]}
                      key={key}
                      itemId={key}
                    >
                      {tabs[key]}
                    </NavItem>
                  );
                })}
              </NavList>
            </Nav>
          </Panel>
        </BaseHeader>

        <Main>
          <section className='body'>{renderContent()}</section>
        </Main>
      </>
    );
  }
}

export default withRouter(AnsibleRoleDetail);
