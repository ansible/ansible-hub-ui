import { Label } from '@patternfly/react-core';
import { TagIcon } from '@patternfly/react-icons';
import * as React from 'react';

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
