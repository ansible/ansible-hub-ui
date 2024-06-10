/* eslint react/prop-types: 0 */
import { t } from '@lingui/macro';
import { Nav, NavExpandable, NavGroup, NavItem } from '@patternfly/react-core';
import { reject, some } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink, NavList } from 'src/components';
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

const altPath = (p) => formatPath(p, {}, null, { ignoreMissing: true });

function standaloneMenu() {
  return [
    menuItem(t`Search`, {
      url: formatPath(Paths.search),
      condition: ({ settings, user }) =>
        settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
        !user.is_anonymous,
    }),
    menuSection(t`Collections`, {}, [
      menuItem(t`Collections`, {
        url: formatPath(Paths.collections),
        condition: ({ settings, user }) =>
          settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
          !user.is_anonymous,
        alternativeUrls: [altPath('/repo/:repo')],
      }),
      menuItem(t`Namespaces`, {
        url: formatPath(Paths.namespaces),
        condition: ({ settings, user }) =>
          settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
          !user.is_anonymous,
        alternativeUrls: [altPath(Paths.myNamespaces)],
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
      t`Roles`,
      {
        condition: ({ featureFlags }) => featureFlags.legacy_roles,
      },
      [
        menuItem(t`Roles`, {
          url: formatPath(Paths.standaloneRoles),
        }),
        menuItem(t`Role Namespaces`, {
          url: formatPath(Paths.standaloneNamespaces),
        }),
        menuItem(t`Role Imports`, {
          url: formatPath(Paths.standaloneImports),
          condition: ({ featureFlags, user }) =>
            featureFlags.legacy_roles && !user.is_anonymous,
        }),
      ],
    ),
    menuItem(t`Task Management`, {
      url: formatPath(Paths.taskList),
      condition: isLoggedIn,
      alternativeUrls: [altPath(Paths.taskDetail)],
    }),
    menuItem(t`Signature Keys`, {
      url: formatPath(Paths.signatureKeys),
      condition: ({ featureFlags, user }) =>
        (featureFlags.collection_signing || featureFlags.container_signing) &&
        !user.is_anonymous,
    }),
    menuSection(t`User Access`, {}, [
      menuItem(t`Users`, {
        condition: (context) => hasPermission(context, 'galaxy.view_user'),
        url: formatPath(Paths.userList),
      }),
      menuItem(t`Groups`, {
        condition: (context) => hasPermission(context, 'galaxy.view_group'),
        url: formatPath(Paths.groupList),
        alternativeUrls: [altPath(Paths.groupDetail)],
      }),
      menuItem(t`Roles`, {
        condition: (context) => hasPermission(context, 'galaxy.view_group'),
        url: formatPath(Paths.roleList),
        alternativeUrls: [altPath(Paths.roleEdit)],
      }),
    ]),
    menuItem(t`Documentation`, {
      url: 'https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/community/userguide/',
      external: true,
      condition: ({ settings, user }) =>
        IS_COMMUNITY &&
        (settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
          !user.is_anonymous),
    }),
    menuItem(t`Terms of Use`, {
      url: 'https://www.redhat.com/en/about/terms-use',
      external: true,
      condition: ({ featureFlags }) => featureFlags.legacy_roles,
    }),
  ];
}

function activateMenu(items, pathname) {
  // ensure no /:var at the end
  const normalize = (s) => s.replace(/\/$/, '').replace(/(\/:[^/:]+)+$/, '');
  const normalizedPathname = normalize(pathname).replace(
    /\/repo\/[^/]+\//,
    '/repo/:repo/',
  );

  items.forEach((item) => {
    item.active =
      item.type === 'section'
        ? activateMenu(item.items, pathname)
        : normalizedPathname.startsWith(normalize(item.url)) ||
          (item.alternativeUrls?.length &&
            item.alternativeUrls.some((url) =>
              normalizedPathname.startsWith(normalize(url)),
            ));
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
        <ExternalLink
          data-cy={`hub-menu-item-${item.name}`}
          href={item.url}
          variant='nav'
        >
          {item.name}
        </ExternalLink>
      ) : item.url ? (
        <Link to={item.url} data-cy={`hub-menu-item-${item.name}`}>
          {item.name}
        </Link>
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
      data-cy={`hub-menu-section-${section.name}`}
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
          key={item.url || item.name}
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
    <Nav onToggle={(_event, data) => onToggle(data)}>
      <NavList>
        <NavGroup className={'hub-nav-title'} title={APPLICATION_NAME} />
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
