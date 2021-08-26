import { t } from '@lingui/macro';
import * as React from 'react';
import './collection-filter.scss';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { AppliedFilters, CompoundFilter } from 'src/components';
import { Constants } from 'src/constants';

interface IProps {
  ignoredParams: string[];
  params: {};
  updateParams: (p) => void;
}

interface IState {
  inputText: string;
}

export class CollectionFilter extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      inputText: '',
    };
  }

  render() {
    const { ignoredParams, params, updateParams } = this.props;

    const filterConfig = [
      {
        id: 'keywords',
        title: t`Keywords`,
      },
      {
        id: 'tags',
        title: t`Tag`,
        inputType: 'multiple' as 'multiple',
        options: Constants.COLLECTION_FILTER_TAGS.map((tag) => ({
          id: tag,
          title: tag,
        })),
      },
    ];

    return (
      <Toolbar>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <CompoundFilter
                inputText={this.state.inputText}
                onChange={(text) => this.setState({ inputText: text })}
                updateParams={updateParams}
                params={params}
                filterConfig={filterConfig}
              />
              <ToolbarItem>
                <AppliedFilters
                  style={{ marginTop: '16px' }}
                  updateParams={updateParams}
                  params={params}
                  ignoredParams={ignoredParams}
                />
              </ToolbarItem>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    );
  }
}
