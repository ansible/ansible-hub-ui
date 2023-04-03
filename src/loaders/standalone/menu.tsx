/* eslint react/prop-types: 0 */
import { t } from '@lingui/macro';
import {
  Nav,
  NavExpandable,
  NavGroup,
  NavItem,
  NavList,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { reject, some } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Paths, formatPath } from 'src/paths';
import {
  canViewAnsibleRemotes,
  canViewAnsibleRepositories,
  isLoggedIn,
} from 'src/permissions';
import { hasPermission } from 'src/utilities';

const menuItem = (name, options = {}) => ({
  active: false,
  condition: () => true,
  ...options,
  type: 'item',
  name,
});

const menuSection = (name, options = {}, items = []) => ({
  active: false,
  condition: (...params) => some(items, (item) => item.condition(...params)), // any visible items inside
  ...options,
  type: 'section',
  name,
  items,
});

function standaloneMenu() {
  return [
    menuSection(t`Collections`, {}, [
      menuItem(t`Collections`, {
        url: formatPath(Paths.collections),
        condition: ({ settings, user }) =>
          settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
          !user.is_anonymous,
      }),
      menuItem(t`Namespaces`, {
        url: formatPath(Paths[NAMESPACE_TERM]),
        condition: ({ settings, user }) =>
          settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
          !user.is_anonymous,
      }),
      menuItem(t`Repositories`, {
        condition: canViewAnsibleRepositories,
        url: formatPath(Paths.ansibleRepositories),
      }),
      menuItem(t`Remotes`, {
        condition: canViewAnsibleRemotes,
        url: formatPath(Paths.ansibleRemotes),
      }),
      menuItem(t`API token`, {
        url: formatPath(Paths.token),
        condition: isLoggedIn,
      }),
      menuItem(t`Approval`, {
        condition: (context) =>
          hasPermission(context, 'ansible.modify_ansible_repo_content'),
        url: formatPath(Paths.approvalDashboard),
      }),
    ]),
    menuSection(
      t`Execution Environments`,
      {
        condition: ({ featureFlags, user }) =>
          featureFlags.execution_environments && !user.is_anonymous,
      },
      [
        menuItem(t`Execution Environments`, {
          url: formatPath(Paths.executionEnvironments),
        }),
        menuItem(t`Remote Registries`, {
          url: formatPath(Paths.executionEnvironmentsRegistries),
        }),
      ],
    ),
    menuSection(
      t`Legacy`,
      {
        condition: ({ featureFlags }) => featureFlags.legacy_roles,
      },
      [
        menuItem(t`Legacy Roles`, {
          url: formatPath(Paths.legacyRoles),
        }),
        menuItem(t`Legacy Namespaces`, {
          url: formatPath(Paths.legacyNamespaces),
        }),
      ],
    ),
    menuItem(t`Task Management`, {
      url: formatPath(Paths.taskList),
      condition: isLoggedIn,
    }),
    menuItem(t`Signature Keys`, {
      url: formatPath(Paths.signatureKeys),
      condition: ({ featureFlags, user }) =>
        (featureFlags.collection_signing || featureFlags.container_signing) &&
        !user.is_anonymous,
    }),
    menuItem(t`Documentation`, {
      url: 'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
      external: true,
      condition: ({ settings, user }) =>
        settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
        !user.is_anonymous,
    }),
    menuItem(t`Terms of Use`, {
      url: 'https://www.redhat.com/en/about/terms-use',
      external: true,
      condition: ({ featureFlags }) => featureFlags.legacy_roles,
    }),
    menuSection(t`User Access`, {}, [
      menuItem(t`Users`, {
        condition: (context) => hasPermission(context, 'galaxy.view_user'),
        url: formatPath(Paths.userList),
      }),
      menuItem(t`Groups`, {
        condition: (context) => hasPermission(context, 'galaxy.view_group'),
        url: formatPath(Paths.groupList),
      }),
      menuItem(t`Roles`, {
        condition: (context) => hasPermission(context, 'galaxy.view_group'),
        url: formatPath(Paths.roleList),
      }),
    ]),
  ];
}

function activateMenu(items, pathname) {
  items.forEach((item) => {
    item.active =
      item.type === 'section'
        ? activateMenu(item.items, pathname)
        : pathname.replace(/\/$/, '').startsWith(item.url.replace(/\/$/, ''));
  });

  return some(items, 'active');
}

function ItemOrSection({ item, context, expandedSections }) {
  return item.type === 'section' ? (
    <MenuSection
      section={item}
      context={context}
      expandedSections={expandedSections}
    />
  ) : (
    <MenuItem item={item} context={context} />
  );
}

function MenuItem({ item, context }) {
  return item.condition(context) ? (
    <NavItem
      isActive={item.active}
      onClick={(e) => {
        item.onclick && item.onclick();
        e.stopPropagation();
      }}
    >
      {item.url && item.external ? (
        <a
          href={item.url}
          data-cy={item['data-cy']}
          target='_blank'
          rel='noreferrer'
        >
          {item.name}
          <ExternalLinkAltIcon
            style={{ position: 'absolute', right: '32px' }}
          />
        </a>
      ) : item.url ? (
        <Link to={item.url}>{item.name}</Link>
      ) : (
        item.name
      )}
    </NavItem>
  ) : null;
}

function MenuSection({ section, context, expandedSections }) {
  return section.condition(context) ? (
    <NavExpandable
      title={section.name}
      groupId={section.name}
      isActive={section.active}
      isExpanded={expandedSections.includes(section.name)}
    >
      <Menu
        items={section.items}
        context={context}
        expandedSections={expandedSections}
      />
    </NavExpandable>
  ) : null;
}

function Menu({ items, context, expandedSections }) {
  return (
    <>
      {items.map((item) => (
        <ItemOrSection
          key={item.name}
          item={item}
          context={context}
          expandedSections={expandedSections}
        />
      ))}
    </>
  );
}

export const StandaloneMenu = ({ context }) => {
  const [expandedSections, setExpandedSections] = useState([]);

  const location = useLocation();
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    setMenu(standaloneMenu());
  }, []);
  useEffect(() => {
    activateMenu(menu, location.pathname);
    setExpandedSections(
      menu.filter((i) => i.type === 'section' && i.active).map((i) => i.name),
    );
  }, [menu, location.pathname]);

  const onToggle = ({ groupId, isExpanded }) => {
    setExpandedSections(
      isExpanded
        ? [...expandedSections, groupId]
        : reject(expandedSections, (name) => name === groupId),
    );
  };

  const StandaloneNav = ({ children = null }) => (
    <Nav theme='dark' onToggle={onToggle}>
      <NavList>
        <NavGroup className={'nav-title'} title={APPLICATION_NAME}></NavGroup>

        {children}
      </NavList>
    </Nav>
  );

  if (!context.user || !context.settings || !context.featureFlags) {
    return <StandaloneNav />;
  }

  return (
    <StandaloneNav>
      <Menu
        items={menu}
        context={context}
        expandedSections={expandedSections}
      />
    </StandaloneNav>
  );
};
