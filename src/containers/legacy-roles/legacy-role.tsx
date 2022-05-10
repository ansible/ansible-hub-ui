import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './legacy-roles.scss';

import { Link } from 'react-router-dom';
import {
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  LabelGroup,
  Switch,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  SearchInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { Panel, PanelMain, PanelMainBody } from '@patternfly/react-core';

import {
  NumericLabel,
  Tag,
  Logo,
  DeprecatedTag,
  DateComponent,
} from 'src/components';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  BaseHeader,
  CardListSwitcher,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageWithHeader,
  LoadingPageSpinner,
  Main,
  Pagination,
  RepoSelector,
} from 'src/components';
import { LegacyAPI } from 'src/api/legacy';
import { LegacyRoleAPI } from 'src/api/legacyrole';
import { LegacyRoleListType } from 'src/api';
import { LegacyRoleListItem } from 'src/components/legacy-role-list/legacy-role-item';
import { ParamHelper } from 'src/utilities/param-helper';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';
//import { filterIsSet } from 'src/utilities';
//import { Paths } from 'src/paths';

import { LegacyRoleDetailType } from 'src/api/response-types/legacy-role';

interface RoleMeta {
  role: LegacyRoleDetailType;
  github_user: string;
  name: string;
  id: number;
}

class LegacyRoleInstall extends React.Component<RoleMeta, RoleMeta> {

    constructor(props) {
        super(props);
        this.state = {
          ...props,
        };
    }

    render() {
        const installCMD = `ansible-galaxy role install ${this.state.github_user}.${this.state.name}`;
        return (<h1>Installation: {installCMD}</h1>);
    }
}

class LegacyRoleDocs extends React.Component<{}, RoleMeta> {
    constructor(props) {
        super(props);
        this.state = {
          ...props,
        };
    }

    render() {
        return (<h1>DOCUMENTATION</h1>);
    }
}

class DocsEntry {
  display: string;
  name: string;
  type: string;
  url?: string;
}

interface IProps {
  role: LegacyRoleDetailType;
  github_user: string;
  name: string;
  id: number;
  activeItem: string;
}

class LegacyRole extends React.Component<RouteComponentProps, IProps> {
  constructor(props) {
    super(props);
    const roleUser = props.match.params.username;
    const roleName = props.match.params.name;
    this.state = {
      ...props,
      role: null,
      github_user: roleUser,
      name: roleName,
      activeItem: 'install',
    };

    this.onSelect = result => {
      this.setState({
          activeItem: result.itemId    
      });
    };

  }

  componentDidMount() {
    console.log('LegacyRole mounted');
    console.log('LegacyRole state', this.state);
    console.log('LegacyRole props', this.props);
    console.log('LegacyAPI', LegacyAPI);
    console.log('LegacyRoleAPI', LegacyRoleAPI);

    const url = 'roles/?github_user=' + this.state.github_user + '&name=' + this.state.name;
    console.log(url);

    LegacyRoleAPI.get_raw(url).then((response) => {
      console.log(response.data);
      const github_user = this.state.github_user;
      const name = this.state.name;
      const activeItem = this.state.activeItem;
      this.setState((state, props) => ({
        role: response.data.results[0],
        github_user: github_user,
        name: name,
        activeItem: activeItem
      }));
    });

  }

  onSelect(e) {
    console.log('onSelecte', e);
    console.log('onSelect e.itemId', e.itemId);

    //const github_user = this.state.github_user;
    //const name = this.state.name;
    //const role = this.state.role;
    this.setState((state, props) => ({
        //role: role,
        //github_user: github_user,
        //name: name,
        activeItem: e.itemId    
    }));

  }

  render() {
    const { role, github_user, name } = this.state;

    if (!role) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    let installCommand = `ansible-galaxy role install ${github_user}.${name}`;

    const header_cells = [];
    if (this.state.role !== undefined && this.state.role !== null) {
        header_cells.push(
          <DataListCell isFilled={false} alignRight={false} key='ns'>
            <Logo
              alt={t`role.github_user logo`}
              fallbackToDefault
              image='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
              size='40px'
              unlockWidth
              width='97px'
            ></Logo>
            <Link to=''>
                {this.state.role.github_user}
            </Link>
          </DataListCell>,
        );

        header_cells.push(
          <DataListCell key='content'>
            <div>
              <TextContent>
                <Text component={TextVariants.h1}>
                  {this.state.role.name}
                </Text>
              </TextContent>
            </div>
            <div className='hub-entry'>{this.state.role.description}</div>
            <div className='hub-entry'>
              <LabelGroup>
                {this.state.role.summary_fields.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </LabelGroup>
            </div>
          </DataListCell>,
        );

        header_cells.push(
          <DataListCell isFilled={false} alignRight key='stats'>
            <div className='hub-right-col hub-entry'>
              <Trans>
                Updated{' '}
                <DateComponent
                  date={this.state.role.summary_fields.versions[0].release_date}
                />
              </Trans>
            </div>
            <div className='hub-entry'>v{this.state.role.summary_fields.versions[0].name}</div>
          </DataListCell>,
        );
    }

    const table = {
      install: {title: 'Install'},
      documentation: {title: 'Documentation'},
    };

    const renderContent = () => {
        if (this.state.activeItem == 'install') {
            return (
                <LegacyRoleInstall 
                    role={this.state.role}
                    github_user={this.state.github_user}
                    name={this.state.name}
                    id={this.state.role.id}
                >
                </LegacyRoleInstall>
            )
        } else if (this.state.activeItem === 'documentation') {
            return (
                <LegacyRoleDocs
                >
                </LegacyRoleDocs>
            )
        } else {
            return <div></div>
        }

    }

    return (
      <React.Fragment>

        {/* TODO: turn the header into breadcrumbs */}
        <BaseHeader title={t`Legacy Roles > ${this.state.github_user} > ${this.state.name}`}></BaseHeader>

        <DataList aria-label={t`Role Header`}>
            <DataListItem data-cy='LegacyRoleListItem'>
              <DataListItemRow>
                <DataListItemCells dataListCells={header_cells} />
              </DataListItemRow>
            </DataListItem>
        </DataList>

        <Panel>
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
                    )
                })}
              </NavList>
            </Nav>

            <PanelMain>
                <PanelMainBody>
                    {renderContent()}
                </PanelMainBody>
            </PanelMain>

        </Panel>

      </React.Fragment>
    );

  }

}

export default withRouter(LegacyRole);

LegacyRole.contextType = AppContext;
