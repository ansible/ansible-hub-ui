import * as React from 'react';
import { PlusCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { ReactElement } from 'react';
import { EmptyStateCustom } from './empty-state-custom';

interface IProps {
  button?: ReactElement;
  title: string;
  description: string;
}

export class EmptyStateNoData extends React.Component<IProps> {
  render() {
    return (
      <EmptyStateCustom
        icon={this.props.button ? PlusCircleIcon : SearchIcon}
        title={this.props.title}
        description={this.props.description}
        button={this.props.button}
      />
    );
  }
}
