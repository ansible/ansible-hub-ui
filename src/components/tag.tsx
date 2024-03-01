import { Label } from '@patternfly/react-core';
import React from 'react';
import './tag.scss';

interface IProps {
  /** Value to display in the tag */
  children: string;
}

export const Tag = ({ children }: IProps) => (
  <Label className='hub-c-label-tag' readOnly data-cy='tag'>
    {children}
  </Label>
);
