import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { ReactElement, ReactNode } from 'react';
import { EmptyStateCustom } from './empty-state-custom';

interface IProps {
  button?: ReactElement;
  title: string;
  description: ReactNode;
}

export const EmptyStateNoData = (props: IProps) => {
  return (
    <EmptyStateCustom
      icon={props.button ? PlusCircleIcon : CubesIcon}
      title={props.title}
      description={props.description}
      button={props.button}
    />
  );
};
