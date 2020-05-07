import * as React from 'react';

import {
  TextInput,
  InputGroup,
  Button,
  ButtonVariant,
  DropdownItem,
} from '@patternfly/react-core';

import { FilterIcon, SearchIcon } from '@patternfly/react-icons';

import { StatefulDropdown } from '../../components';
import { ParamHelper } from '../../utilities';

class FilterOption {
  id: string;
  title: string;
  placeholder?: string;
  inputType?: 'text-field' | 'select';
  options?: { id: string; title: string }[];
}

interface IProps {
  /** Configures the options that the filter displays */
  filterConfig: FilterOption[];

  /** Current page params */
  params: any;

  /** Sets the current page params to p */
  updateParams: (params) => void;
}

interface IState {
  selectedFilter: FilterOption;
  inputText: string;
}

export class CompoundFilter extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      selectedFilter: props.filterConfig[0],
      inputText: '',
    };
  }

  render() {
    const { params, filterConfig } = this.props;
    const { selectedFilter, inputText } = this.state;

    const filterOptions = filterConfig.map(v => (
      <DropdownItem
        onClick={() => this.setState({ selectedFilter: v, inputText: '' })}
        key={v.id}
      >
        {v.title}
      </DropdownItem>
    ));

    return (
      <InputGroup>
        <StatefulDropdown
          toggleType='dropdown'
          defaultText={
            <span>
              <FilterIcon />
              {'   '}
              {selectedFilter.title}
            </span>
          }
          position='left'
          isPlain={false}
          items={filterOptions}
        />
        {this.renderInput(selectedFilter)}
        <Button
          onClick={() => this.submitFilter()}
          variant={ButtonVariant.control}
        >
          <SearchIcon></SearchIcon>
        </Button>
      </InputGroup>
    );
  }

  private renderInput(selectedFilter: FilterOption) {
    switch (selectedFilter.inputType) {
      case 'select':
        return (
          <StatefulDropdown
            toggleType='dropdown'
            defaultText={
              this.state.inputText ||
              selectedFilter.placeholder ||
              selectedFilter.title
            }
            isPlain={false}
            position='left'
            items={selectedFilter.options.map((v, i) => (
              <DropdownItem
                onClick={() =>
                  this.setState({ inputText: v.id }, () => this.submitFilter())
                }
                key={v.id}
              >
                {v.title}
              </DropdownItem>
            ))}
          />
        );
      default:
        return (
          <TextInput
            placeholder={
              selectedFilter.placeholder || `Filter by ${selectedFilter.title}`
            }
            value={this.state.inputText}
            onChange={k => this.setState({ inputText: k })}
            onKeyPress={e => this.handleEnter(e)}
          />
        );
    }
  }

  private handleEnter(e) {
    if (e.key === 'Enter') {
      this.submitFilter();
    }
  }

  private submitFilter() {
    this.props.updateParams(
      ParamHelper.setParam(
        this.props.params,
        this.state.selectedFilter.id,
        this.state.inputText,
      ),
    );
  }
}
