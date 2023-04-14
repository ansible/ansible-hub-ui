import { t } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  DropdownItem,
  InputGroup,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  TextInput,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { APISearchTypeAhead, StatefulDropdown } from 'src/components';
import { ParamHelper } from 'src/utilities';

export class FilterOption {
  id: string;
  title: string;
  placeholder?: string;
  inputType?: 'text-field' | 'select' | 'multiple' | 'typeahead';
  options?: { id: string; title: string }[];
}

interface IProps {
  /** Configures the options that the filter displays */
  filterConfig: FilterOption[];

  /** Current page params */
  // Type help: this shoud be something like: Record<string, string | SelectOptionObject | (string | SelectOptionObject)[]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;

  /** Sets the current page params to p */
  updateParams: (params) => void;

  inputText: string;

  onChange: (inputText: string) => void;

  selectFilter?: (filterId: string) => void;
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
    const { filterConfig, selectFilter } = this.props;
    const { selectedFilter } = this.state;

    if (filterConfig.length === 0) {
      return null;
    }

    const filterOptions = filterConfig.map((v) => (
      <DropdownItem
        onClick={() => {
          this.props.onChange('');
          this.setState({ selectedFilter: v });
          selectFilter && selectFilter(v.id);
        }}
        key={v.id}
      >
        {v.title}
      </DropdownItem>
    ));

    return (
      <InputGroup data-cy='compound_filter'>
        {filterConfig.length !== 1 && (
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
        )}
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
            {[
              <SelectGroup
                label={t`Filter by ${selectedFilter.id}`}
                key={selectedFilter.id}
              >
                {selectedFilter.options.map((option) => (
                  // patternfly does not allow for us to set a display name aside from the ID
                  // which unfortunately means that multiple select will ignore the human readable
                  // option.title
                  <SelectOption key={option.id} value={option.id} />
                ))}
              </SelectGroup>,
            ]}
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
            items={selectedFilter.options.map((v) => (
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
      case 'typeahead': {
        const typeAheadResults = this.props.filterConfig
          .find(({ id }) => id === selectedFilter.id)
          .options.map(({ id, title }) => ({ id, name: title }));
        return (
          <APISearchTypeAhead
            multiple={false}
            loadResults={(name) => {
              this.props.onChange(name);
            }}
            onClear={() => {
              this.props.onChange('');
            }}
            onSelect={(event, value) => {
              this.submitFilter(value);
            }}
            placeholderText={
              selectedFilter?.placeholder ||
              t`Filter by ${selectedFilter.title.toLowerCase()}`
            }
            results={typeAheadResults}
          />
        );
      }
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
    if (e.key === 'Enter' && this.props.inputText.trim().length > 0) {
      this.submitFilter();
    }
  }

  private submitMultiple(newValues: string[]) {
    this.props.updateParams({
      ...ParamHelper.setParam(
        this.props.params,
        this.state.selectedFilter.id,
        newValues,
      ),
      page: 1,
    });
  }

  private submitFilter(id = undefined) {
    this.props.updateParams({
      ...ParamHelper.setParam(
        this.props.params,
        this.state.selectedFilter.id,
        id ? id : this.props.inputText,
      ),
      page: 1,
    });
  }

  private onToggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  private onSelectMultiple = (event) => {
    let newParams = this.props.params[this.state.selectedFilter.id];

    // no tags => falsy
    // 1 tag => "foo"
    // 2+ tags => ["foo", "bar"]
    // convert all to an array
    if (!newParams) {
      newParams = [];
    }
    if (!Array.isArray(newParams)) {
      newParams = [newParams];
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
    if (!inputText || !selectedFilter?.options) {
      return inputText;
    }

    return selectedFilter.options.find((opt) => opt.id === inputText).title;
  }
}
