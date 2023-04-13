import { Trans, t } from '@lingui/macro';
import {
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  LabelGroup,
  Nav,
  NavItem,
  NavList,
  Panel,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { LegacyRoleAPI } from 'src/api/legacyrole';
import { LegacyRoleDetailType } from 'src/api/response-types/legacy-role';
import { LegacyRoleVersionDetailType } from 'src/api/response-types/legacy-role';
import { EmptyStateNoData } from 'src/components';
import {
  Breadcrumbs,
  ClipboardCopy,
  DateComponent,
  LoadingPageWithHeader,
  Logo,
  Main,
  Tag,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { RouteProps, chipGroupProps, withRouter } from 'src/utilities';
import './legacy-roles.scss';

interface RoleMeta {
  role: LegacyRoleDetailType;
  github_user: string;
  name: string;
  id: number;
}

interface RoleMetaReadme {
  readme_html: string;
}

class LegacyRoleInstall extends React.Component<RoleMeta, RoleMeta> {
  render() {
    const installCMD = `ansible-galaxy role install ${this.props.github_user}.${this.props.name}`;
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

class LegacyRoleDocs extends React.Component<RoleMeta, RoleMetaReadme> {
  constructor(props) {
    super(props);
    this.state = {
      readme_html: null,
    };
  }

  componentDidMount() {
    const url = 'roles/' + this.props.role.id + '/content';
    LegacyRoleAPI.get(url).then((response) => {
      this.setState(() => ({
        readme_html: response.data.readme_html,
      }));
    });
  }

  render() {
    return (
      <div className='legacy-role-readme-container'>
        <div
          className='pf-c-content'
          dangerouslySetInnerHTML={{ __html: this.state.readme_html }}
        ></div>
      </div>
    );
  }
}

interface RoleVersionIProps {
  role_version: LegacyRoleVersionDetailType;
}

class LegacyRoleVersion extends React.Component<
  RoleVersionIProps,
  RoleVersionIProps
> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <DataListItemRow>
        <DataListCell alignRight>
          {this.props.role_version.version}
        </DataListCell>

        <DataListCell alignRight>
          <Trans>
            Released <DateComponent date={this.props.role_version.created} />
          </Trans>
        </DataListCell>

        {/* Release tarballs hosted on github */}
        <DataListCell alignRight>
          <a
            href={this.props.role_version.download_url}
            target='_blank'
            rel='noreferrer'
          />
        </DataListCell>
      </DataListItemRow>
    );
  }
}

interface RoleVersionsIProps {
  role_versions: LegacyRoleVersionDetailType[];
  loading: boolean;
}

class LegacyRoleVersions extends React.Component<RoleMeta, RoleVersionsIProps> {
  constructor(props) {
    super(props);
    this.state = {
      role_versions: [],
      loading: true,
    };
  }

  componentDidMount() {
    const url = 'roles/' + this.props.role.id + '/versions';
    LegacyRoleAPI.get(url).then((response) => {
      this.setState(() => ({
        role_versions: response.data.results,
        loading: false,
      }));
    });
  }

  render() {
    return (
      <div id='versions-div'>
        {!this.state.loading &&
        this.state.role_versions &&
        this.state.role_versions.length == 0 ? (
          <EmptyStateNoData
            title={t`No versions`}
            description={t`The role is versionless and will always install from the head/main/master branch.`}
          />
        ) : (
          ''
        )}

        <DataList aria-label={t`List of versions`}>
          {this.state.role_versions.reverse().map((rversion) => (
            <DataListItem key={rversion.name} aria-labelledby='compact-item2'>
              <LegacyRoleVersion role_version={rversion} />
            </DataListItem>
          ))}
        </DataList>
      </div>
    );
  }
}

interface IProps {
  role: LegacyRoleDetailType;
  github_user: string;
  name: string;
  id: number;
  activeItem: string;
}

class LegacyRole extends React.Component<RouteProps, IProps> {
  constructor(props) {
    super(props);
    const roleUser = props.routeParams.username;
    const roleName = props.routeParams.name;
    this.state = {
      id: null,
      role: null,
      github_user: roleUser,
      name: roleName,
      activeItem: 'install',
    };

    this.onSelect = (result) => {
      this.setState({
        activeItem: result.itemId,
      });
    };
  }

  componentDidMount() {
    const url =
      'roles/?github_user=' +
      this.state.github_user +
      '&name=' +
      this.state.name;

    LegacyRoleAPI.get(url).then((response) => {
      const github_user = this.state.github_user;
      const name = this.state.name;
      const activeItem = this.state.activeItem;
      const role = response.data.results[0];
      this.setState(() => ({
        id: role.id,
        role: role,
        github_user: github_user,
        name: name,
        activeItem: activeItem,
      }));
    });
  }

  onSelect(e) {
    this.setState(() => ({
      activeItem: e.itemId,
    }));
  }

  render() {
    const { role } = this.state;
    if (!role) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const repository =
      'https://github.com/' + role.github_user + '/' + role.github_repo;
    const namespace = role.summary_fields.namespace;
    const namespace_url = formatPath(Paths.legacyNamespace, {
      namespaceid: namespace.id,
    });
    let release_date = null;
    let release_name = null;
    const ix = role.summary_fields.versions.length - 1;
    const lv = role.summary_fields.versions[ix];
    if (lv !== undefined && lv !== null) {
      release_date = lv.release_date;
      release_name = lv.name;
    }
    if (
      release_date === undefined ||
      release_date === null ||
      release_date === ''
    ) {
      release_date = role.modified;
    }
    if (
      release_name === undefined ||
      release_name === null ||
      release_name === ''
    ) {
      release_name = '';
    }

    const header_cells = [];
    if (this.state.role !== undefined && this.state.role !== null) {
      header_cells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns'>
          <Logo
            alt={t`${role.github_user} logo`}
            fallbackToDefault
            image={role.summary_fields.namespace.avatar_url}
            size='70px'
            unlockWidth
            width='97px'
          ></Logo>
          <Link to={namespace_url}>{namespace.name}</Link>
        </DataListCell>,
      );

      header_cells.push(
        <DataListCell key='content'>
          <div>
            <TextContent>
              <Text component={TextVariants.h1}>
                {namespace.name}.{this.state.role.name}
              </Text>
            </TextContent>
          </div>
          <div className='hub-entry'>{this.state.role.description}</div>
          <div className='hub-entry'>
            <LabelGroup {...chipGroupProps()}>
              {this.state.role.summary_fields.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </LabelGroup>
          </div>
        </DataListCell>,
      );

      header_cells.push(
        <DataListCell isFilled={false} alignRight key='version'>
          <div className='hub-right-col hub-entry'>
            <Trans>
              Updated <DateComponent date={release_date} />
            </Trans>
          </div>
          {release_name && <div className='hub-entry'>{release_name}</div>}
          <div className='hub-entry'>
            <a href={repository}>
              Github Repository <ExternalLinkAltIcon />
            </a>
          </div>
        </DataListCell>,
      );
    }

    const table = {
      install: { title: 'Install' },
      documentation: { title: 'Documentation' },
      versions: { title: 'Versions' },
    };

    const renderContent = () => {
      if (this.state.activeItem == 'install') {
        return (
          <LegacyRoleInstall
            role={this.state.role}
            github_user={this.state.github_user}
            name={this.state.name}
            id={this.state.role.id}
          ></LegacyRoleInstall>
        );
      } else if (this.state.activeItem === 'documentation') {
        return (
          <LegacyRoleDocs
            role={this.state.role}
            github_user={this.state.github_user}
            name={this.state.name}
            id={this.state.role.id}
          ></LegacyRoleDocs>
        );
      } else if (this.state.activeItem === 'versions') {
        return (
          <LegacyRoleVersions
            role={this.state.role}
            github_user={this.state.github_user}
            name={this.state.name}
            id={this.state.role.id}
          ></LegacyRoleVersions>
        );
      } else {
        return <div></div>;
      }
    };

    const breadcrumbs = [
      {
        name: 'Legacy Roles',
        url: formatPath(Paths.legacyRoles, {}),
      },
      {
        name: this.state.github_user,
        url: formatPath(Paths.legacyNamespace, { namespaceid: namespace.id }),
      },
      {
        name: this.state.name,
        url: formatPath(Paths.legacyRole, {
          username: this.state.github_user,
          name: this.state.name,
        }),
      },
    ];

    return (
      <React.Fragment>
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
          <Nav theme='light' variant='tertiary' onSelect={this.onSelect}>
            <NavList>
              {Object.keys(table).map((key) => {
                return (
                  <NavItem
                    isActive={this.state.activeItem === key}
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
      </React.Fragment>
    );
  }
}

export default withRouter(LegacyRole);

LegacyRole.contextType = AppContext;
