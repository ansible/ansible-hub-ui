import { Label } from '@patternfly/react-core';
import TagIcon from '@patternfly/react-icons/dist/esm/icons/tag-icon';

interface IProps {
  tag: string;
}

export const TagLabel = ({ tag }: IProps) => (
  <Label variant='outline' icon={<TagIcon />}>
    {tag}
  </Label>
);
