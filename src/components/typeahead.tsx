import { t } from '@lingui/macro';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import React, { type CSSProperties, Component, type ReactElement } from 'react';

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
  toggleIcon?: ReactElement;
  style?: CSSProperties;
}

interface IState {
  isOpen: boolean;
}

export class Typeahead extends Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  render() {
    let selected = null;
    if (this.props.selections) {
      selected = this.props.selections.map((group) => group.name);
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
        onToggle={(_event, isOpen) => this.onToggle(isOpen)}
        variant={variant}
        selections={selected}
        isOpen={isOpen}
        hasInlineFilter
        onFilter={this.onFilter}
        placeholderText={this.props.placeholderText}
        isDisabled={this.props.isDisabled}
        toggleIcon={this.props.toggleIcon}
        style={this.props.style}
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
    const options = this.props.results.map(({ id, name }) => (
      <SelectOption key={id} value={name} />
    ));

    if (options.length === 0) {
      options.push(
        <SelectOption key={'not_found'} value={t`Not found`} isDisabled />,
      );
    }

    return options;
  }

  private onFilter = (evt) => {
    if (evt !== null) {
      const textInput = evt.target.value;
      this.props.loadResults(textInput);
    }
    return this.getOptions();
  };

  private onToggle = (isOpen) => {
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
