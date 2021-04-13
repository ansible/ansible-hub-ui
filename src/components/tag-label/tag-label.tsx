import * as React from 'react';
import { Label } from '@patternfly/react-core';
import { TagIcon } from '@patternfly/react-icons';

interface IProps {
  tag: string;
}

export class TagLabel extends React.Component<IProps> {
  render() {
    const { tag } = this.props;
    return (
      <Label variant='outline' icon={<TagIcon />}>
        {tag}
      </Label>
    );
  }
}
