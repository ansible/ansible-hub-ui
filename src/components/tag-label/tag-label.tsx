import { Label } from '@patternfly/react-core';
import { TagIcon } from '@patternfly/react-icons';

interface IProps {
  tag: string;
}

export const TagLabel = ({ tag }: IProps) => (
  <Label variant='outline' icon={<TagIcon />}>
    {tag}
  </Label>
);
