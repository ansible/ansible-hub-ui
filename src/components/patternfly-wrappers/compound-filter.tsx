import { t } from '@lingui/macro';
import * as React from 'react';

import {
  TextInput,
  InputGroup,
  Button,
  ButtonVariant,
  DropdownItem,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

import { FilterIcon, SearchIcon } from '@patternfly/react-icons';

import { StatefulDropdown } from 'src/components';
import { ParamHelper } from 'src/utilities';

class FilterOption {
  id: string;
  title: string;
  placeholder?: string;
  inputType?: 'text-field' | 'select' | 'multiple';
  options?: { id: string; title: string }[];
}

interface IProps {
  /** Configures the options that the filter displays */
  filterConfig: FilterOption[];

  /** Current page params */
  params: any;

  /** Sets the current page params to p */
  updateParams: (params) => void;

  inputText: string;

  onChange: (inputText: string) => void;
}

interface IState {
  selectedFilter: FilterOption;
  isExpanded: boolean;
  isCreatable: boolean;
  isOpen: boolean;
  hasOnCreateOption: boolean;
}

export class CompoundFilter extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      selectedFilter: props.filterConfig[0],
      isExpanded: false,
      isCreatable: false,
      isOpen: false,
      hasOnCreateOption: false,
    };
  }

  render() {
    const { filterConfig } = this.props;
    const { selectedFilter } = this.state;

    const filterOptions = filterConfig.map((v) => (
      <DropdownItem
        onClick={() => {
          this.props.onChange('');
          this.setState({ selectedFilter: v });
        }}
        key={v.id}
      >
        {v.title}
      </DropdownItem>
    ));

    let select;
    if (filterConfig.length != 1)
    {
      select = <StatefulDropdown
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
      />; 
    }else
    {
      select = <div style={{verticalAlign : 'center'}}>{filterConfig[0].title}</div>;
    }

    return (
      <InputGroup>
        {select}
        {this.renderInput(selectedFilter)}
        <Button
          onClick={() => this.submitFilter()}
          variant={ButtonVariant.control}
          isDisabled={!this.props.inputText.trim().length}
        >
          <SearchIcon></SearchIcon>
        </Button>
      </InputGroup>
    );
  }

  private renderInput(selectedFilter: FilterOption) {
    switch (selectedFilter.inputType) {
      case 'multiple':
        const options = selectedFilter.options.map((option) => (
          // patternfly does not allow for us to set a display name aside from the ID
          // which unfortunately means that multiple select will ignore the human readable
          // option.title
          <SelectOption key={option.id} value={option.id} />
        ));

        const toggle = [
          <SelectGroup
            label={t`Filter by ${selectedFilter.id}`}
            key={selectedFilter.id}
          >
            {options}
          </SelectGroup>,
        ];

        return (
          <Select
            variant={SelectVariant.checkbox}
            onToggle={this.onToggle}
            onSelect={this.onSelectMultiple}
            isOpen={this.state.isOpen}
            placeholderText={t`Filter by ${selectedFilter.id.toLowerCase()}`}
            selections={this.props.params[this.state.selectedFilter.id]}
            isGrouped
          >
            {toggle}
          </Select>
        );
      case 'select':
        return (
          <StatefulDropdown
            toggleType='dropdown'
            defaultText={
              this.selectTitleById(this.props.inputText, selectedFilter) ||
              selectedFilter.placeholder ||
              selectedFilter.title
            }
            isPlain={false}
            position='left'
            items={selectedFilter.options.map((v, i) => (
              <DropdownItem
                onClick={() => {
                  this.props.onChange(v.id);
                  this.submitFilter(v.id);
                }}
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
            aria-label={selectedFilter.id}
            placeholder={
              selectedFilter.placeholder ||
              t`Filter by ${selectedFilter.title.toLowerCase()}`
            }
            value={this.props.inputText}
            onChange={(k) => this.props.onChange(k)}
            onKeyPress={(e) => this.handleEnter(e)}
          />
        );
    }
  }

  private handleEnter(e) {
    // l10n: don't translate
    if (e.key === 'Enter' && this.props.inputText.length > 0) {
      this.submitFilter();
    }
  }

  private submitMultiple(newValues: string[]) {
    this.props.updateParams(
      ParamHelper.setParam(
        this.props.params,
        this.state.selectedFilter.id,
        newValues,
      ),
    );
  }

  private submitFilter(id = undefined) {
    this.props.updateParams(
      ParamHelper.setParam(
        this.props.params,
        this.state.selectedFilter.id,
        id ? id : this.props.inputText,
      ),
    );
  }

  private onToggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  private onSelectMultiple = (event) => {
    let newParams = this.props.params[this.state.selectedFilter.id];
    if (!newParams) {
      newParams = [];
    }

    // TODO: Remove this replace after patternfly fixes the pf-random-id issue
    const selectedID = event.currentTarget.id.replace(/pf-random-id-\d+-/, '');
    if (newParams.includes(selectedID)) {
      const index = newParams.indexOf(selectedID);
      if (index > -1) {
        newParams.splice(index, 1);
      }
    } else {
      newParams.push(selectedID);
    }
    this.submitMultiple(newParams);
  };

  private selectTitleById(inputText: string, selectedFilter: FilterOption) {
    if (!inputText || !selectedFilter?.options) return inputText;

    return selectedFilter.options.find((opt) => opt.id === inputText).title;
  }
}
