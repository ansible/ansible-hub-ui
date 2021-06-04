import * as React from 'react';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { AppliedFilters, CompoundFilter } from 'src/components';

interface IProps {
  ignoredParams: string[];
  params: {};
  updateParams: (p) => void;
}

export class CollectionFilter extends React.Component<IProps> {
  render() {
    const { ignoredParams, params, updateParams } = this.props;

    const tags = [
      'cloud',
      'linux',
      'networking',
      'storage',
      'security',
      'windows',
      'infrastructure',
      'monitoring',
      'tools',
      'database',
      'application',
    ];

    const filterConfig = [
      {
        id: 'keywords',
        title: 'Keywords',
      },
      {
        id: 'tags',
        title: 'Tag',
        inputType: 'multiple' as 'multiple',
        options: tags.map(tag => ({
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
