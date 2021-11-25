import * as React from 'react';
import cx from 'classnames';
import './switcher.scss';

import { ListIcon, ThLargeIcon } from '@patternfly/react-icons';

import { ParamHelper } from 'src/utilities/param-helper';

interface IProps {
  params: {
    view_type?: string;
  };
  updateParams: (params) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export class CardListSwitcher extends React.Component<IProps> {
  static defaultProps = {
    size: 'sm',
  };

  render() {
    let disp = this.props.params.view_type;
    const { updateParams, params, size, className } = this.props;

    if (!disp) {
      disp = 'card';
    }

    const iconClasses = ['icon', 'clickable'];

    return (
      <div className={className}>
        <span data-cy='view_type_card'>
          <ThLargeIcon
            size={size}
            className={cx(iconClasses, { selected: disp === 'card' })}
            onClick={() =>
              updateParams(ParamHelper.setParam(params, 'view_type', 'card'))
            }
          />
        </span>
        <span data-cy='view_type_list'>
          <ListIcon
            size={size}
            className={cx(iconClasses, { selected: disp === 'list' })}
            onClick={() =>
              updateParams(ParamHelper.setParam(params, 'view_type', 'list'))
            }
          />
        </span>
      </div>
    );
  }
}
