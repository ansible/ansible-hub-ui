import * as React from 'react';

import {
  SortAmountDownIcon,
  SortAmountUpIcon,
  SortAlphaDownIcon,
  SortAlphaUpIcon,
} from '@patternfly/react-icons';
import { ParamHelper } from '../../utilities';

interface IProps {
  options: object;
  params: object;
  updateParams: (params) => void;
  sortParamName?: string;
}

export class SortTable extends React.Component<IProps> {
  private sort(id) {
    console.log('ID: ' + id);
    debugger;
    this.props.updateParams(
      ParamHelper.setParam(this.props.params, 'sort', (false ? '-' : '') + id),
    );
  }
  private getIcon(type, id) {
    if (type == '') {
      return;
    }
    let Icon;
    switch (type) {
      case 'downAlpha':
        Icon = SortAlphaDownIcon;
        break;
      case 'upAlpha':
        Icon = SortAlphaUpIcon;
        break;
      case 'downAmount':
        Icon = SortAmountDownIcon;
        break;
      case 'upAmount':
        Icon = SortAmountUpIcon;
    }
    return (
      <Icon
        className='clickable asc-button'
        size='sm'
        onClick={() => this.sort(id)}
      />
    );
  }
  private getHeaderItem(item) {
    return (
      <th id={item.id}>
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
