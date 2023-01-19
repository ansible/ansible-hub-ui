import { ListIcon, ThLargeIcon } from '@patternfly/react-icons';
import cx from 'classnames';
import * as React from 'react';
import { ParamHelper } from 'src/utilities/param-helper';
import './switcher.scss';

interface IProps {
  params: {
    view_type?: string;
  };
  updateParams: (params) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CardListSwitcher: React.FunctionComponent<IProps> = ({
  params,
  updateParams,
  size = 'sm',
  className,
}) => {
  let disp = params.view_type;

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
};
