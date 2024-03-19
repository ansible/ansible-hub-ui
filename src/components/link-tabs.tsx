import cx from 'classnames';
import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface LinkTabsProps {
  /** List of tabs */
  tabs: {
    active?: boolean;
    link: string;
    title: string;
    icon?: ReactNode;
  }[];
}

const renderTab = ({ link, title, icon = null, active = false }) => (
  <li
    className={cx({
      'pf-v5-c-tabs__item': true,
      'pf-m-current': active,
    })}
    key={title}
  >
    <Link to={link} className='pf-v5-c-tabs__link'>
      <span className='pf-v5-c-tabs__item-text'>
        {icon ? <>{icon} </> : null}
        {title}
      </span>
    </Link>
  </li>
);

// We're not using the Tab react component because they don't support links.
export const LinkTabs = ({ tabs }: LinkTabsProps) => (
  <div className='pf-v5-c-tabs'>
    <ul className='pf-v5-c-tabs__list'>
      {tabs.filter(Boolean).map((tab) => renderTab(tab))}
    </ul>
  </div>
);
