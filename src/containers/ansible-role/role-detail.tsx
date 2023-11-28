import { Trans, t } from '@lingui/macro';
import {
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Nav,
  NavItem,
  NavList,
  Panel,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import DownloadIcon from '@patternfly/react-icons/dist/esm/icons/download-icon';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  LegacyRoleAPI,
  LegacyRoleDetailType,
  LegacyRoleVersionDetailType,
} from 'src/api';
import { EmptyStateNoData } from 'src/components';
import {
  AlertList,
  AlertType,
  Breadcrumbs,
  ClipboardCopy,
  DateComponent,
  DownloadCount,
  ExternalLink,
  LabelGroup,
  LoadingPageWithHeader,
  Logo,
  Main,
  RoleRatings,
  Tag,
  closeAlertMixin,
} from 'src/components';
import { NotFound } from 'src/containers/not-found/not-found';
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

class RoleInstall extends React.Component<RoleMetaProps> {
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

class RoleDocs extends React.Component<RoleMetaProps, RoleMetaReadmeState> {
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
          className='pf-c-content'
          dangerouslySetInnerHTML={{ __html: this.state.readme_html }}
        />
      </div>
    );
  }
}

interface RoleVersionProps {
  role_version: LegacyRoleVersionDetailType;
}

class RoleVersion extends React.Component<RoleVersionProps> {
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

class RoleVersions extends React.Component<
  RoleVersionsProps,
  RoleVersionsState
> {
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

interface RoleState {
  activeItem: string;
  alerts: AlertType[];
  loading: boolean;
  name: string;
  namespace: string;
  role: LegacyRoleDetailType;
}

class AnsibleRoleDetail extends React.Component<RouteProps, RoleState> {
  constructor(props) {
    super(props);

    const { namespace, name } = props.routeParams;
    this.state = {
      activeItem: 'install',
      alerts: [],
      loading: true,
      name,
      namespace,
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
      .then(({ data: { results } }) =>
        this.setState({ role: results[0], loading: false }),
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

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  render() {
    const { activeItem, alerts, loading, name, role } = this.state;

    if (loading) {
      return <LoadingPageWithHeader />;
    }

    if (!role) {
      return (
        <>
          <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
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

    const header_cells = [
      <DataListCell isFilled={false} alignRight={false} key='ns'>
        <Logo
          alt={t`${namespace.name} logo`}
          fallbackToDefault
          image={role.summary_fields.namespace.avatar_url}
          size='70px'
          unlockWidth
          width='97px'
        />
        <Link to={namespace_url}>{namespace.name}</Link>
      </DataListCell>,
      <DataListCell key='content'>
        <div>
          <TextContent>
            <Text component={TextVariants.h1}>
              {namespace.name}.{role.name}
            </Text>
          </TextContent>
        </div>
        <div className='hub-entry'>{role.description}</div>
        <div className='hub-entry'>
          <LabelGroup>
            {role.summary_fields.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </LabelGroup>
        </div>
      </DataListCell>,
      <DataListCell isFilled={false} alignRight key='version'>
        <div className='hub-right-col hub-entry'>
          <Trans>
            Updated <DateComponent date={release_date} />
          </Trans>
        </div>
        {release_name && <div className='hub-entry'>{release_name}</div>}
        <div className='hub-entry'>
          <ExternalLink href={repository}>{t`GitHub Repository`}</ExternalLink>
        </div>
        <div className='hub-entry'>
          <RoleRatings namespace={namespace.name} name={role.name} />
          <DownloadCount item={role} />
        </div>
      </DataListCell>,
    ];

    const table = {
      install: { title: t`Install` },
      documentation: { title: t`Documentation` },
      versions: { title: t`Versions` },
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
    ];

    const onSelect = (result) =>
      this.setState({
        activeItem: result.itemId,
      });

    return (
      <>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />

        <DataList aria-label={t`Role Header`}>
          <DataListItem data-cy='LegacyRoleListItem'>
            {/* This renders a bit too small ...? */}
            <DataListItemRow>
              <Breadcrumbs links={breadcrumbs} />
            </DataListItemRow>

            <DataListItemRow>
              <DataListItemCells dataListCells={header_cells} />
            </DataListItemRow>
          </DataListItem>
        </DataList>

        <Panel isScrollable>
          <Nav theme='light' variant='tertiary' onSelect={onSelect}>
            <NavList>
              {Object.keys(table).map((key) => {
                return (
                  <NavItem
                    isActive={activeItem === key}
                    title={table[key].title}
                    key={key}
                    itemId={key}
                  >
                    {table[key].title}
                  </NavItem>
                );
              })}
            </NavList>
          </Nav>
        </Panel>

        <Main>
          <section className='body'>{renderContent()}</section>
        </Main>
      </>
    );
  }
}

export default withRouter(AnsibleRoleDetail);