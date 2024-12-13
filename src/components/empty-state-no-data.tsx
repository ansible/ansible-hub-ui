import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { type ReactElement, type ReactNode } from 'react';
import { EmptyStateCustom } from 'src/components';

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
