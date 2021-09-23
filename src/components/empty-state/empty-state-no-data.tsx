import * as React from 'react';
import { PlusCircleIcon, CubesIcon } from '@patternfly/react-icons';
import { ReactElement, ReactNode } from 'react';
import { EmptyStateCustom } from './empty-state-custom';

interface IProps {
  button?: ReactElement;
  title: string;
  description: ReactNode;
}

export class EmptyStateNoData extends React.Component<IProps> {
  render() {
    return (
      <EmptyStateCustom
        icon={this.props.button ? PlusCircleIcon : CubesIcon}
        title={this.props.title}
        description={this.props.description}
        button={this.props.button}
      />
    );
  }
}
