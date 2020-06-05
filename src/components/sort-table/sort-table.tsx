import * as React from 'react';

import {
  LongArrowAltUpIcon,
  LongArrowAltDownIcon,
  ArrowsAltVIcon,
} from '@patternfly/react-icons';
import { ParamHelper } from '../../utilities';
import './sort-table.scss';

interface IProps {
  options: {
    headers: {
      title: string;
      type: string;
      id: string;
    }[];
  };
  params: object;
  updateParams: (params) => void;
}

export class SortTable extends React.Component<IProps> {
  private sort(type, id) {
    this.props.updateParams(
      ParamHelper.setParam(
        this.props.params,
        'sort',
        (type.includes('up') ? '-' : '') + id,
      ),
    );
  }
  private getIcon(type, id) {
    if (type == '') {
      return;
    }
    let Icon;
    switch (type) {
      case 'down':
        Icon = LongArrowAltDownIcon;
        break;
      case 'up':
        Icon = LongArrowAltUpIcon;
        break;
      case 'none':
        Icon = ArrowsAltVIcon;
    }
    return (
      <Icon
        size='sm'
        onClick={() => this.sort(type, id)}
        className={'clickable ' + (type == 'none' ? 'inactive' : 'active')}
      />
    );
  }

  private getHeaderItem(item) {
    return (
      <th key={item.id}>
        {item.title} {this.getIcon(item.type, item.id)}
      </th>
    );
  }

  render() {
    return (
      <thead>
        <tr aria-labelledby='headers'>
          {this.props.options['headers'].map(element =>
            this.getHeaderItem(element),
          )}
        </tr>
      </thead>
    );
  }
}
