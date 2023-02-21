import { t } from '@lingui/macro';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { AppliedFilters, CompoundFilter } from 'src/components';
import { Constants } from 'src/constants';
import { useContext } from 'src/loaders/app-context';
import './collection-filter.scss';

interface IProps {
  ignoredParams: string[];
  params: {
    keywords?: string;
    page?: number;
    page_size?: number;
    tags?: string[];
    view_type?: string;
  };
  updateParams: (p) => void;
}

export const CollectionFilter = (props: IProps) => {
  const context = useContext();
  const [inputText, setInputText] = useState(props.params.keywords || '');

  useEffect(() => {
    setInputText(props.params['keywords'] || '');
  }, [props.params.keywords]);

  const { ignoredParams, params, updateParams } = props;
  const { display_signatures } = context.featureFlags;
  const display_tags = ignoredParams.includes('tags') === false;

  const filterConfig = [
    {
      id: 'keywords',
      title: t`Keywords`,
    },
    display_tags && {
      id: 'tags',
      title: t`Tag`,
      inputType: 'multiple' as const,
      options: Constants.COLLECTION_FILTER_TAGS.map((tag) => ({
        id: tag,
        title: tag,
      })),
    },
    display_signatures && {
      id: 'sign_state',
      title: t`Sign state`,
      inputType: 'select' as const,
      options: [
        { id: 'signed', title: t`Signed` },
        { id: 'unsigned', title: t`Unsigned` },
      ],
    },
  ].filter(Boolean);

  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup style={{ marginLeft: 0 }}>
          <ToolbarItem>
            <CompoundFilter
              inputText={inputText}
              onChange={(text) => setInputText(text)}
              updateParams={updateParams}
              params={params}
              filterConfig={filterConfig}
            />
            <ToolbarItem>
              <AppliedFilters
                niceNames={{
                  sign_state: t`sign state`,
                  tags: t`tags`,
                  keywords: t`keywords`,
                }}
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
};
