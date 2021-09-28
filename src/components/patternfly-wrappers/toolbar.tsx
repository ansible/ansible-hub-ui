import * as React from 'react';
import { t } from '@lingui/macro';

import {
  Toolbar as ToolbarPF,
  ToolbarGroup,
  ToolbarItem,
  ToolbarContent,
  TextInput,
  InputGroup,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';

import { SearchIcon } from '@patternfly/react-icons';

import { ParamHelper } from 'src/utilities/param-helper';
import { Sort } from 'src/components';

import { SortFieldType } from './sort';

interface IProps {
  /** Current page params */
  params: {
    sort?: string;
    keywords?: string;
  };

  /** List of sort options that the user can pick from */
  sortOptions?: SortFieldType[];

  /** Sets the current page params to p */
  updateParams: (params) => void;

  /** Search bar placeholder text*/
  searchPlaceholder: string;

  /** Extra set of customizeable inputs that appear to right of sort*/
  extraInputs?: React.ReactNode[];
}

interface IState {
  kwField: string;
}

// FIXME: only used in collection-list & namespace-list, other Toolbar is unrelated; merge
export class Toolbar extends React.Component<IProps, IState> {
  static defaultProps = {
    extraInputs: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      kwField: props.params.keywords || '',
    };
  }

  render() {
    const {
      params,
      sortOptions,
      updateParams,
      searchPlaceholder,
      extraInputs,
    } = this.props;
    const { kwField } = this.state;
    return (
      <ToolbarPF>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <InputGroup>
                <TextInput
                  value={kwField}
                  onChange={(k) => this.setState({ kwField: k })}
                  onKeyPress={(e) => this.handleEnter(e)}
                  type='search'
                  aria-label={t`search text input`}
                  placeholder={searchPlaceholder}
                />
                <Button
                  variant={ButtonVariant.control}
                  aria-label={t`search button`}
                  onClick={() => this.submitKeywords()}
                >
                  <SearchIcon />
                </Button>
              </InputGroup>
            </ToolbarItem>
          </ToolbarGroup>
          {sortOptions && (
            <ToolbarGroup>
              <ToolbarItem>
                <Sort
                  options={sortOptions}
                  params={params}
                  updateParams={updateParams}
                />
              </ToolbarItem>
            </ToolbarGroup>
          )}
          {extraInputs}
        </ToolbarContent>
      </ToolbarPF>
    );
  }

  private handleEnter(e) {
    // l10n: don't translate
    if (e.key === 'Enter') {
      this.submitKeywords();
    }
  }

  private submitKeywords() {
    this.props.updateParams({
      ...ParamHelper.setParam(
        this.props.params,
        'keywords',
        this.state.kwField,
      ),
      page: 1, // always reset the page when searching
    });
  }
}
