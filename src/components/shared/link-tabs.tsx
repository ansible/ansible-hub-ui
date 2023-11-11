import cx from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

export interface IProps {
  /** List of tabs */
  tabs: {
    active?: boolean;
    link: string;
    title: string;
  }[];
}

const renderTab = ({ link, title, active = false }) => (
  <li
    className={cx({
      'pf-c-tabs__item': true,
      'pf-m-current': active,
    })}
    key={title}
  >
    <Link to={link} className='pf-c-tabs__link'>
      <span className='pf-c-tabs__item-text'>{title}</span>
    </Link>
  </li>
);

// We're not using the Tab react component because they don't support links.
export const LinkTabs = ({ tabs }: IProps) => (
  <div className='pf-c-tabs'>
    <ul className='pf-c-tabs__list'>{tabs.map((tab) => renderTab(tab))}</ul>
  </div>
);
