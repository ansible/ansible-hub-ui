import { plural } from '@lingui/macro';
import * as React from 'react';

interface IProps {
  number: number;
  newline?: boolean;
  label: string;
}

class NumericLabel extends React.Component<IProps> {
  render() {
    const { number, newline, label } = this.props;

    let numberElem = (
      <span key='number'>{NumericLabel.roundNumber(number)} </span>
    );
    let labelElem = (
      <span key='label' className='hub-numeric-label-label'>
        {label}
      </span>
    );

    if (newline) {
      numberElem = <div>{numberElem}</div>;
      labelElem = <div>{labelElem}</div>;
    }

    return (
      <div>
        {numberElem}
        {labelElem}
      </div>
    );
  }

  // Make this a static property so that we can use this function outside of
  // rendering the whole component
  static roundNumber(n: number): string {
    if (n < 1000) {
      // returns 1 to 999
      return n.toString();
    } else if (n < 10000) {
      // returns 1K to 9.9K
      return (Math.floor(n / 100) / 10).toString() + 'K';
    } else if (n < 1000000) {
      // returns 10K to 999K
      return Math.floor(n / 1000).toString() + 'K';
    } else if (n < 100000000) {
      // returns 1M to 9.9M
      return (Math.floor(n / 100000) / 10).toString() + 'M';
    } else if (n < 1000000000) {
      return Math.floor(n / 1000000).toString() + 'M';
    }

    // If larger than a billion, don't even bother.
    return '1B+';
  }
}

interface ICNLProps {
  count: number;
  newline?: boolean;
  type: string;
}

export class CollectionNumericLabel extends React.Component<ICNLProps> {
  render() {
    const { count, newline, type } = this.props;

    const label =
      {
        module: plural(count, {
          one: 'Module',
          other: 'Modules',
        }),
        role: plural(count, {
          one: 'Role',
          other: 'Roles',
        }),
        plugin: plural(count, {
          one: 'Plugin',
          other: 'Plugins',
        }),
        dependency: plural(count, {
          one: 'Dependency',
          other: 'Dependencies',
        }),
      }[type] || type;

    return <NumericLabel number={count} newline={newline} label={label} />;
  }
}
