import * as React from 'react';
import { Label, Tooltip } from '@patternfly/react-core';
import { truncateSha } from 'src/utilities';

interface IProps {
  digest: string;
  grey?: boolean;
  long?: boolean;
}

export class ShaLabel extends React.Component<IProps> {
  render() {
    const { digest, grey, long } = this.props;

    return (
      <Tooltip content={digest}>
        <Label color={grey ? 'grey' : 'blue'}>
          {long ? digest : truncateSha(digest)}
        </Label>
      </Tooltip>
    );
  }
}
