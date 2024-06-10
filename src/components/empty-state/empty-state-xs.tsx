import React, { type ReactElement, type ReactNode } from 'react';
import { EmptyStateCustom } from './empty-state-custom';

interface IProps {
  button?: ReactElement;
  title: string;
  description: ReactNode;
}

export const EmptyStateXs = (props: IProps) => {
  return (
    <EmptyStateCustom
      variant='xs'
      title={props.title}
      description={props.description}
      button={props.button}
    />
  );
};
