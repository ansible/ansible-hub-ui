import * as React from 'react';

import {
  LongArrowAltUpIcon,
  LongArrowAltDownIcon,
  ArrowsAltVIcon,
} from '@patternfly/react-icons';
import { ParamHelper } from 'src/utilities';
import './sort-table.scss';

interface IProps {
  options: {
    headers: {
      title: string;
      type: string;
      id: string;
      className?: string;
    }[];
  };
  params: object;
  updateParams: (params) => void;
}

export class SortTable extends React.Component<IProps> {
  private sort(id, isMinus) {
    // Alphabetical sorting is inverted in Django, so flip it here to make
    // things match up with the UI.
    isMinus = !isMinus;
    this.props.updateParams(
      ParamHelper.setParam(
        this.props.params,
        'sort',
        (isMinus ? '-' : '') + id,
      ),
    );
  }
  private getIcon(type, id) {
    if (type == 'none') {
      return;
    }
    let Icon;
    const activeIcon =
      !!this.props.params['sort'] &&
      id == this.props.params['sort'].replace('-', '');
    let isMinus = false;
    if (activeIcon) {
      isMinus = this.props.params['sort'].includes('-');
      let up = isMinus;
      if (type == 'alpha') {
        up = !up;
      }
      Icon = up ? LongArrowAltDownIcon : LongArrowAltUpIcon;
    } else {
      Icon = ArrowsAltVIcon;
    }

    return (
      <Icon
        data-cy={'sort_' + id}
        size='sm'
        onClick={() => this.sort(id, isMinus)}
        className={'clickable ' + (activeIcon ? 'active' : 'inactive')}
      />
    );
  }

  private getHeaderItem(item) {
    return (
      <th key={item.id} className={item?.className}>
        {item.title} {this.getIcon(item.type, item.id)}
      </th>
    );
  }

  render() {
    return (
      <thead>
        <tr aria-labelledby='headers'>
          {this.props.options['headers'].map((element) =>
            this.getHeaderItem(element),
          )}
        </tr>
      </thead>
    );
  }
}
