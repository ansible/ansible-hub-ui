import * as React from 'react';

interface IProps {
    number: number | string;
    label?: string;
}

export class NumericLabel extends React.Component<IProps, {}> {
    render() {
        const { number, label } = this.props;
        let convertedNum: number;

        if (typeof number === 'string') {
            convertedNum = Number(number);
        } else {
            convertedNum = number;
        }

        const plural = number === 1 ? '' : 's';

        return (
            <span>
                {this.roundNumber(convertedNum)} {label ? label + plural : null}
            </span>
        );
    }

    private roundNumber(n: number): string {
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
