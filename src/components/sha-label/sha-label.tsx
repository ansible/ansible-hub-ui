import * as React from 'react';
import { Label, Tooltip } from '@patternfly/react-core';
import { truncateSha } from 'src/utilities';

interface IProps {
  digest: string;
}

export class ShaLabel extends React.Component<IProps> {
  render() {
    return (
      <Tooltip content={this.props.digest}>
        <Label color='blue'>{truncateSha(this.props.digest)}</Label>
      </Tooltip>
    );
  }
}
