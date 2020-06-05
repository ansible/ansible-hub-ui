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
    let isDescending = this.props.params['sort'].includes('-');
    // Alphabetical sorting is inverted in Django, so flip it here to make
    // things match up with the UI.
    if (type == 'alpha') {
      isDescending = !isDescending;
    }
    this.props.updateParams(
      ParamHelper.setParam(
        this.props.params,
        'sort',
        (isDescending ? '' : '-') + id,
      ),
    );
  }
  private getIcon(type, id) {
    if (type == 'none') {
      return;
    }
    let Icon;
    let activeIcon = id == this.props.params['sort'].replace('-', '');
    if (activeIcon) {
      let isDescending = this.props.params['sort'].includes('-');
      if (type == 'alpha') {
        isDescending = !isDescending;
      }
      Icon = isDescending ? LongArrowAltDownIcon : LongArrowAltUpIcon;
    } else {
      Icon = ArrowsAltVIcon;
    }

    return (
      <Icon
        size='sm'
        onClick={() => this.sort(type, id)}
        className={'clickable ' + (activeIcon ? 'active' : 'inactive')}
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
