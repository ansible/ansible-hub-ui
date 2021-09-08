import * as React from 'react';

interface IProps {
  className?: string;
  number: number | string;
  label?: string;
  hideNumber?: boolean;
  pluralLabels?: {
    [key: string]: {
      '0': string;
      '1': string;
      other: string;
    }[];
  };
}

export class NumericLabel extends React.Component<IProps, {}> {
  render() {
    const { className, number, label, hideNumber, pluralLabels } = this.props;
    let convertedNum: number;

    if (typeof number === 'string') {
      convertedNum = Number(number);
    } else {
      convertedNum = number;
    }

    const plural = number === 1 ? '' : 's';

    return (
      <div>
        <span>
          {hideNumber ? null : NumericLabel.roundNumber(convertedNum)}{' '}
        </span>
        <span className={className}>
          {pluralLabels ? (
            <>{this.setPluralLabel(pluralLabels, number)}</>
          ) : (
            <> {label ? label + plural : null} </>
          )}
        </span>
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

  private setPluralLabel(plurals, number) {
    return number === 0 || number === 1 ? plurals[number] : plurals['other'];
  }
}
