import * as React from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

interface IProps {
  results: { name: string; id: number | string }[];
  loadResults: (filter: string) => void;
  onSelect: (event, selection, isPlaceholder) => void;

  selections?: { name: string; id: number | string }[];
  multiple?: boolean;
  placeholderText?: string;
  onClear?: () => void;

  isDisabled?: boolean;
  endLink?: {
    href: string;
    name: string;
  };
  menuAppendTo?: 'parent' | 'inline';
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
    let selected = null;
    if (this.props.selections) {
      selected = this.props.selections.map(group => group.name);
    }

    const { isOpen } = this.state;
    const variant = this.props.multiple
      ? SelectVariant.typeaheadMulti
      : SelectVariant.typeahead;

    return (
      <Select
        menuAppendTo={this.props.menuAppendTo}
        onClear={this.onClear}
        onSelect={this.onSelect}
        onToggle={this.onToggle}
        variant={variant}
        selections={selected}
        isOpen={isOpen}
        hasInlineFilter
        onFilter={this.onFilter}
        placeholderText={this.props.placeholderText}
        isDisabled={this.props.isDisabled}
      >
        {this.getOptions()}
      </Select>
    );
  }

  private onClear = () => {
    this.props.loadResults('');
    if (this.props.onClear) {
      this.props.onClear();
    }
  };

  private getOptions() {
    const options = [];

    for (const option of this.props.results) {
      options.push(<SelectOption key={option.id} value={option.name} />);
    }

    if (options.length === 0) {
      options.push(
        <SelectOption
          key={'not_found'}
          value={_`Not found`}
          isDisabled={true}
        />,
      );
    }

    return options;
  }

  private onFilter = evt => {
    if (evt !== null) {
      const textInput = evt.target.value;
      this.props.loadResults(textInput);
    }
    return this.getOptions();
  };

  private onToggle = isOpen => {
    this.setState({
      isOpen,
    });
  };

  private onSelect = (event, selection, isPlaceholder) => {
    this.props.onSelect(event, selection, isPlaceholder);

    if (!this.props.multiple) {
      this.setState(
        {
          isOpen: false,
        },
        () => this.props.loadResults(''),
      );
    }
  };
}
