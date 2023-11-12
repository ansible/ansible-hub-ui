import { t } from '@lingui/macro';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React from 'react';
import { useEffect, useState } from 'react';
import { AnsibleRepositoryAPI, TagAPI } from 'src/api';
import { AppliedFilters, CompoundFilter } from 'src/components';
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
    repository_name?: string;
  };
  updateParams: (p) => void;
}

const _loadRepos = (inputText) =>
  AnsibleRepositoryAPI.list({
    name__icontains: inputText,
    pulp_label_select: '!hide_from_search',
  }).then(({ data: { results } }) =>
    results.map(({ name }) => ({
      id: name,
      title: name,
    })),
  );

const _loadTags = (inputText) =>
  TagAPI.listCollections({ name__icontains: inputText, sort: '-count' }).then(
    ({ data: { data } }) =>
      data.map(({ name, count }) => ({
        id: name,
        title: count === undefined ? name : t`${name} (${count})`,
      })),
  );

CollectionFilter.CF = ({
  featureFlags: { display_signatures, display_repositories },
  ignoredParams: i,
}) => {
  const displayNamespaces = !i.includes('namespace');
  const displayRepos = display_repositories && !i.includes('repository_name');
  const displayTags = !i.includes('tags');

  const filterConfig = [
    {
      id: 'keywords',
      title: t`Keywords`,
    },
    displayRepos && {
      id: 'repository_name',
      title: t`Repository`,
      inputType: 'typeahead' as const,
    },
    displayNamespaces && {
      id: 'namespace',
      title: t`Namespace`,
    },
    displayTags && {
      id: 'tags',
      title: t`Tag`,
      inputType: 'typeahead' as const,
    },
    display_signatures && {
      id: 'is_signed',
      title: t`Sign state`,
      inputType: 'select' as const,
      options: [
        { id: 'true', title: t`Signed` },
        { id: 'false', title: t`Unsigned` },
      ],
    },
  ].filter(Boolean);

  return {
    filterConfig,
    typeaheads: {
      repository_name: _loadRepos,
      tags: _loadTags,
    },
  };
};

export function CollectionFilter(props: IProps) {
  const context = useContext();
  const { ignoredParams, params, updateParams } = props;
  const { display_signatures, display_repositories } = context.featureFlags;
  const displayTags = ignoredParams.includes('tags') === false;
  const displayRepos =
    ignoredParams.includes('repository_name') === false && display_repositories;
  const displayNamespaces = ignoredParams.includes('namespace') === false;

  const [repositories, setRepositories] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [tags, setTags] = useState([]);

  const loadRepos = () => _loadRepos(inputText).then(setRepositories);
  const loadTags = () => _loadTags(inputText).then(setTags);

  useEffect(() => {
    if (selectedFilter === 'repository_name') {
      loadRepos();
    }
    if (selectedFilter === 'tags' && displayTags) {
      loadTags();
    }
  }, [selectedFilter]);

  useEffect(() => {
    setInputText(props.params['keywords'] || '');
  }, [props.params.keywords]);

  useEffect(() => {
    setInputText(props.params['repository_name'] || '');
  }, [props.params.repository_name]);

  useEffect(() => {
    if (inputText != '' && selectedFilter === 'repository_name') {
      loadRepos();
    }
  }, [inputText]);

  useEffect(() => {
    if (inputText != '' && selectedFilter === 'tags' && displayTags) {
      loadTags();
    }
  }, [inputText]);

  const filterConfig = [
    {
      id: 'keywords',
      title: t`Keywords`,
    },
    displayRepos && {
      id: 'repository_name',
      title: t`Repository`,
      inputType: 'typeahead' as const,
      options: repositories,
    },
    displayNamespaces && {
      id: 'namespace',
      title: t`Namespace`,
    },
    displayTags && {
      id: 'tags',
      title: t`Tag`,
      inputType: 'typeahead' as const,
      options: tags,
    },
    display_signatures && {
      id: 'is_signed',
      title: t`Sign state`,
      inputType: 'select' as const,
      options: [
        { id: 'true', title: t`Signed` },
        { id: 'false', title: t`Unsigned` },
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
              selectFilter={setSelectedFilter}
            />
            <ToolbarItem>
              <AppliedFilters
                niceNames={{
                  is_signed: t`Sign state`,
                  tags: t`Tags`,
                  keywords: t`Keywords`,
                  repository_name: t`Repository`,
                  namespace: t`Namespace`,
                }}
                niceValues={{
                  is_signed: {
                    false: t`unsigned`,
                    true: t`signed`,
                  },
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
}
