import ListIcon from '@patternfly/react-icons/dist/esm/icons/list-icon';
import ThLargeIcon from '@patternfly/react-icons/dist/esm/icons/th-large-icon';
import cx from 'classnames';
import React, { type FunctionComponent } from 'react';
import { Icon } from 'src/components';
import { ParamHelper } from 'src/utilities';
import './switcher.scss';

interface IProps {
  params: {
    view_type?: string;
  };
  updateParams: (params) => void;
}

export const CardListSwitcher: FunctionComponent<IProps> = ({
  params,
  updateParams,
}) => {
  const disp = params.view_type || 'card';

  return (
    <div style={{ paddingTop: '6px' }}>
      <span data-cy='view_type_card'>
        <Icon
          className={cx('hub-switcher-icon', { selected: disp === 'card' })}
          onClick={() =>
            updateParams(ParamHelper.setParam(params, 'view_type', 'card'))
          }
        >
          <ThLargeIcon />
        </Icon>
      </span>
      <span data-cy='view_type_list'>
        <Icon
          className={cx('hub-switcher-icon', { selected: disp === 'list' })}
          onClick={() =>
            updateParams(ParamHelper.setParam(params, 'view_type', 'list'))
          }
        >
          <ListIcon />
        </Icon>
      </span>
    </div>
  );
};
