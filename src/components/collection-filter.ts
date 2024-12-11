import { t } from '@lingui/core/macro';
import { AnsibleRepositoryAPI, TagAPI } from 'src/api';

const loadRepos = (inputText) =>
  AnsibleRepositoryAPI.list({
    name__icontains: inputText,
    pulp_label_select: '!hide_from_search',
  }).then(({ data: { results } }) =>
    results.map(({ name }) => ({
      id: name,
      title: name,
    })),
  );

// insights-only
const defaultTags = [
  'application',
  'cloud',
  'database',
  'eda',
  'infrastructure',
  'linux',
  'monitoring',
  'networking',
  'security',
  'storage',
  'tools',
  'windows',
].map((tag) => ({ id: tag, title: tag }));

const loadTags = (inputText) =>
  !inputText && IS_INSIGHTS
    ? Promise.resolve(defaultTags)
    : TagAPI.listCollections({
        name__icontains: inputText,
        sort: '-count',
      }).then(({ data: { data } }) =>
        data.map(({ name, count }) => ({
          id: name,
          title: count === undefined ? name : t`${name} (${count})`,
        })),
      );

export const collectionFilter = ({
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

  const sortOptions = [
    { title: t`Name`, id: 'name', type: 'alpha' as const },
    { title: t`Namespace`, id: 'namespace', type: 'alpha' as const },
    { title: t`Last modified`, id: 'pulp_created', type: 'numeric' as const },
    { title: t`Version`, id: 'version', type: 'numeric' as const },
  ];

  return {
    filterConfig,
    sortOptions,
    typeaheads: {
      repository_name: loadRepos,
      tags: loadTags,
    },
  };
};
