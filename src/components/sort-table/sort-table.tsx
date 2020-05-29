import * as React from 'react';

import {
  LongArrowAltUpIcon,
  LongArrowAltDownIcon,
  ArrowsAltVIcon,
} from '@patternfly/react-icons';
import { ParamHelper } from '../../utilities';

interface IProps {
  options: object;
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
        className='clickable asc-button'
        size='sm'
        onClick={() => this.sort(type, id)}
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
