import { Label } from '@patternfly/react-core';

interface IProps {
  /** Value to display in the tag */
  children: string;
}

export const Tag = ({ children }: IProps) => (
  <Label style={{ margin: '4px' }} readOnly data-cy='tag'>
    {children}
  </Label>
);
