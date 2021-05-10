import * as React from 'react';
import cx from 'classnames';

import { Link } from 'react-router-dom';

interface IProps {
  /** List of tabs */
  tabs: {
    active?: boolean;
    link: string;
    title: string;
  }[];
}

// We're not using the Tab react component because they don't support links.
export class LinkTabs extends React.Component<IProps> {
  render() {
    return (
      <div className='pf-c-tabs'>
        <ul className='pf-c-tabs__list'>
          {this.props.tabs.map(tab => this.renderTab(tab))}
        </ul>
      </div>
    );
  }

  private renderTab({ link, title, active = false }) {
    return (
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
  }
}
