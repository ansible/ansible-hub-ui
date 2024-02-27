import { Icon } from '@patternfly/react-core';
import ListIcon from '@patternfly/react-icons/dist/esm/icons/list-icon';
import ThLargeIcon from '@patternfly/react-icons/dist/esm/icons/th-large-icon';
import cx from 'classnames';
import React, { FunctionComponent } from 'react';
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
  const iconClasses = ['icon', 'clickable'];

  return (
    <div>
      <span data-cy='view_type_card'>
        <Icon
          className={cx(iconClasses, { selected: disp === 'card' })}
          onClick={() =>
            updateParams(ParamHelper.setParam(params, 'view_type', 'card'))
          }
        >
          <ThLargeIcon />
        </Icon>
      </span>
      <span data-cy='view_type_list'>
        <Icon
          className={cx(iconClasses, { selected: disp === 'list' })}
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
