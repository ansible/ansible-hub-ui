import { t } from '@lingui/macro';
import { Icon } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import SortAlphaDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-alpha-down-icon';
import SortAlphaUpIcon from '@patternfly/react-icons/dist/esm/icons/sort-alpha-up-icon';
import SortAmountDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';
import SortAmountUpIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-up-icon';
import React, { Component } from 'react';
import { ParamHelper } from 'src/utilities';

export interface SortFieldType {
  id: string;
  title: string;
  type: 'numeric' | 'alpha';
}

interface IProps {
  /** List of sort options that the user can pick from */
  options: SortFieldType[];

  /** Current page params */
  params: object;

  /** Sets the current page params to p */
  updateParams: (params) => void;

  /** Specify the name of the parameter that contains sort information */
  sortParamName?: string;
}

interface IState {
  isExpanded: boolean;
}

export class Sort extends Component<IProps, IState> {
  options: { id: string; title: string }[];
  static defaultProps = {
    sortParamName: 'sort',
  };

  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false,
    };
  }

  private onToggle(isExpanded) {
    this.setState({
      isExpanded,
    });
  }

  private onSelect(name) {
    let isDescending = this.getIsDescending(this.props.params);

    const option = this.props.options.find((i) => i.title === name);

    // Alphabetical sorting is inverted in Django, so flip it here to make
    // things match up with the UI.
    if (option.type === 'alpha') {
      isDescending = !isDescending;
    }
    const desc = isDescending ? '-' : '';

    this.setState({ isExpanded: false }, () =>
      this.props.updateParams({
        ...ParamHelper.setParam(
          this.props.params,
          this.props.sortParamName,
          desc + option.id,
        ),
        page: 1,
      }),
    );
  }

  private setDescending() {
    const field = this.getSelected(this.props.params);
    const descending = !this.getIsDescending(this.props.params);

    this.props.updateParams({
      ...ParamHelper.setParam(
        this.props.params,
        this.props.sortParamName,
        (descending ? '-' : '') + field.id,
      ),
      page: 1,
    });
  }

  private getIsDescending(params) {
    const sort = params[this.props.sortParamName];

    // The ?sort= url param is not always guaranteed to be set. If it's
    // not set, return the default
    if (!sort) {
      return true;
    }
    return sort.startsWith('-');
  }

  private getSelected(params) {
    let sort = params[this.props.sortParamName];
    const def = this.props.options[0];

    if (!sort) {
      return def;
    }

    if (sort.startsWith('-')) {
      sort = sort.substring(1, sort.length);
    }

    const option = this.props.options.find((x) => x.id === sort);

    return option ? option : def;
  }

  render() {
    const { options, params } = this.props;
    const { isExpanded } = this.state;

    const selectedOption = this.getSelected(params);

    const [IconAsc, IconDesc] =
      selectedOption.type === 'alpha'
        ? [SortAlphaDownIcon, SortAlphaUpIcon]
        : [SortAmountUpIcon, SortAmountDownIcon];

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {options.length > 1 ? (
          <Select
            variant={SelectVariant.single}
            aria-label={t`Sort results`}
            onToggle={(_event, e) => this.onToggle(e)}
            onSelect={(_, name) => this.onSelect(name)}
            selections={selectedOption.title}
            isOpen={isExpanded}
          >
            {options.map((option) => (
              <SelectOption key={option.id} value={option.title} />
            ))}
          </Select>
        ) : null}

        <Icon
          className='clickable'
          onClick={() => this.setDescending()}
          style={{ margin: '6px 0 6px 5px' }}
        >
          {this.getIsDescending(params) ? <IconDesc /> : <IconAsc />}
        </Icon>
      </div>
    );
  }
}
