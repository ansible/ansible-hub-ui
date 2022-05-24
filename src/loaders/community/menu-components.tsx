import * as React from 'react';

import { reject, some } from 'lodash';

import {
  withRouter,
  Link,
  RouteComponentProps,
  matchPath,
} from 'react-router-dom';

import {
  DropdownItem,
  DropdownSeparator,
  Nav,
  NavExpandable,
  NavGroup,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
} from '@patternfly/react-core';

import {
  ExternalLinkAltIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';

export const Menu = ({ items }) => (
  <>
    {items.map((item) => (
      <ItemOrSection key={item.name} item={item} />
    ))}
  </>
);

// const menuItem = (name, options = {}) => ({
export const MenuItem = ({ item }) => {
  const name = item.name;
  console.log('MenuItem item', name, item);

  const user = item.user;
  const settings = item.settings;
  const featureFlags = item.featureFlags;

  if (featureFlags) {
    const check = item.condition({ user, settings, featureFlags });
    console.log('CHECK', check);
  }

  //return item.condition({ user, settings, featureFlags }) ? (

  return (
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
  );
};

export const MenuSection = ({ section }) => {
  return (
    <NavExpandable
      title={section.name}
      groupId={section.name}
      isActive={section.active}
      isExpanded={true}
    >
      <Menu items={section.items} />
    </NavExpandable>
  );
};

const ItemOrSection = ({ item }) =>
  item.type === 'section' ? (
    <MenuSection section={item} />
  ) : (
    <MenuItem item={item} />
  );

export const onToggle = ({ groupId, isExpanded }) => {
  /*
  const menuExpandedSections = [];
  this.setState({
    menuExpandedSections: isExpanded
      ? [...menuExpandedSections, groupId]
      : reject(menuExpandedSections, (name) => name === groupId),
  });
  */
};
