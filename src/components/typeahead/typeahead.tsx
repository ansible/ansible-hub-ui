import * as React from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

interface IProps {
  results: { name: string; id: number | string }[];
  loadResults: (filter: string) => void;
  onSelect: (event, selection, isPlaceholder) => void;

  selections?: { name: string; id: number | string };
  placeholderText?: string;

  endLink?: {
    href: string;
    name: string;
  };
}

interface IState {
  isOpen: boolean;
}

export class APISearchTypeAhead extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  render() {
    const { isOpen } = this.state;

    return (
      <Select
        onClear={() => this.props.loadResults('')}
        onSelect={this.onSelect}
        onToggle={this.onToggle}
        variant={SelectVariant.typeahead}
        isOpen={isOpen}
        hasInlineFilter
        onFilter={this.onFilter}
        placeholderText={this.props.placeholderText}
      >
        {this.getOptions()}
      </Select>
    );
  }

  private getOptions() {
    const options = [];

    for (const option of this.props.results) {
      options.push(<SelectOption key={option.id} value={option.name} />);
    }

    return options;
  }

  private onFilter = evt => {
    const textInput = evt.target.value;
    this.props.loadResults(textInput);
    return this.getOptions();
  };

  private onToggle = isOpen => {
    this.setState({
      isOpen,
    });
  };

  private onSelect = (event, selection, isPlaceholder) => {
    this.props.onSelect(event, selection, isPlaceholder);

    this.setState(
      {
        isOpen: false,
      },
      () => this.props.loadResults(''),
    );
  };
}
