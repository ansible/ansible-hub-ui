import * as React from 'react';
import cx from 'classnames';
import { ListIcon, ThLargeIcon } from '@patternfly/react-icons';

import { ParamHelper } from 'src/utilities/param-helper';
import './switcher.scss';

interface IProps {
  params: {
    view_type?: string;
  };
  updateParams: (params) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export class CardListSwitcher extends React.Component<IProps> {
  static defaultProps = {
    size: 'sm',
  };

  render() {
    const disp = this.props.params.view_type || 'card';
    const { params, size, updateParams } = this.props;
    const iconClasses = ['hub-icon', 'hub-m-clickable'];

    return (
      <div className='hub-c-card-list-switcher'>
        <span data-cy='view_type_card'>
          <ThLargeIcon
            size={size}
            className={cx(iconClasses, { 'hub-selected': disp === 'card' })}
            onClick={() =>
              updateParams(ParamHelper.setParam(params, 'view_type', 'card'))
            }
          />
        </span>
        <span data-cy='view_type_list'>
          <ListIcon
            size={size}
            className={cx(iconClasses, { 'hub-selected': disp === 'list' })}
            onClick={() =>
              updateParams(ParamHelper.setParam(params, 'view_type', 'list'))
            }
          />
        </span>
      </div>
    );
  }
}
