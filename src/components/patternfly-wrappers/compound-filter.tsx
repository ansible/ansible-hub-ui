import * as React from 'react';

import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuPosition,
  OptionsMenuToggle,
  TextInput,
  InputGroup,
  Button,
  ButtonVariant,
  DropdownItem,
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

import { FilterIcon, SearchIcon } from '@patternfly/react-icons';

import { StatefulDropdown } from '../../components';
import { ParamHelper } from '../../utilities';

class FilterOption {
  id: string;
  title: string;
  placeholder?: string;
  inputType?: 'text-field' | 'select' | 'multiple';
  options?: { id: string; title: string }[];
}

interface IProps {
  filterConfig: FilterOption[];
  params: any;
  updateParams: (params) => void;
}

interface IState {
  selectedFilter: FilterOption;
  inputText: string;
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
      inputText: '',
      isExpanded: false,
      isCreatable: false,
      isOpen: false,
      hasOnCreateOption: false,
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
      case 'multiple':
        const options = selectedFilter.options.map(option => (
          <OptionsMenuItem
            onSelect={this.onSelect}
            isSelected={this.filterApplied(option.id)}
            id={option.id}
            key={option.id}
          >
            {option.title}
          </OptionsMenuItem>
        ));

        const toggle = (
          <OptionsMenuToggle
            onToggle={this.onToggle}
            toggleTemplate={'Filter by ' + selectedFilter.id}
          />
        );
        return (
          <OptionsMenu
            id='options-menu-align-right-example'
            position={OptionsMenuPosition.right}
            menuItems={options}
            toggle={toggle}
            isOpen={this.state.isOpen}
          />
        );
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
    if (this.state.selectedFilter.inputType === 'multiple') {
      this.props.updateParams(
        ParamHelper.setParam(
          this.props.params,
          this.state.selectedFilter.id,
          this.props.params[this.state.selectedFilter.id],
        ),
      );
    } else {
      this.props.updateParams(
        ParamHelper.setParam(
          this.props.params,
          this.state.selectedFilter.id,
          this.state.inputText,
        ),
      );
    }
  }

  private onToggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  private filterApplied = filter => {
    return this.props.params[this.state.selectedFilter.id].includes(filter);
  };

  private onSelect = event => {
    let selected = event.currentTarget.id;
    let newSelection = Object.assign({}, this.props.params);
    if (this.filterApplied(selected)) {
      const index = newSelection[this.state.selectedFilter.id].indexOf(
        selected,
      );
      if (index > -1) {
        newSelection[this.state.selectedFilter.id].splice(index, 1);
      }
    } else {
      newSelection[this.state.selectedFilter.id].push(selected);
    }
    this.submitFilter();
  };

  private clearSelection = () => {
    this.setState({
      isOpen: false,
    });
  };
}
