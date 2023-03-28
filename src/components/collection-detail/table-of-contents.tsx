import { t } from '@lingui/macro';
import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  SearchInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { capitalize } from 'lodash';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DocsBlobType } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, sanitizeDocsUrls } from 'src/utilities';

class DocsEntry {
  display: string;
  name: string;
  type: string;
  url?: string;
}

class Table {
  documentation: DocsEntry[];
  modules: DocsEntry[];
  roles: DocsEntry[];
  plugins: DocsEntry[];
  playbooks: DocsEntry[];
}

interface IProps {
  docs_blob: DocsBlobType;
  namespace: string;
  collection: string;
  repository: string;
  params: { keywords?: string };
  selectedName?: string;
  selectedType?: string;
  className?: string;
  updateParams: (p) => void;
  searchBarRef?: React.Ref<HTMLInputElement>;
}

export const TableOfContents = (props: IProps) => {
  const [docsBlob, setDocsBlob] = useState<DocsBlobType>(null);
  const [table, setTable] = useState<Table>(null);

  const collapsedCategories = [];
  const { className, docs_blob, updateParams, params } = props;

  if (!table || docsBlob !== docs_blob) {
    setTable(parseLinks(docs_blob, props));
    setDocsBlob(docs_blob);
  }

  return (
    <div className={className}>
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem>
            <SearchInput
              ref={props.searchBarRef}
              value={params.keywords}
              onChange={(_e, val) =>
                updateParams(ParamHelper.setParam(params, 'keywords', val))
              }
              onClear={() =>
                updateParams(ParamHelper.setParam(params, 'keywords', ''))
              }
              aria-label={t`find-content`}
              placeholder={t`Find content`}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
      <Nav theme='light'>
        <NavList>
          {table != null &&
            Object.keys(table).map((key) =>
              table[key].length === 0
                ? null
                : renderLinks(
                    table[key],
                    key,
                    props.params.keywords || '',
                    collapsedCategories,
                    props,
                  ),
            )}
        </NavList>
      </Nav>
    </div>
  );
};

function parseLinks(docs_blob: DocsBlobType, props): Table {
  const { namespace, collection } = props;

  const baseUrlParams = {
    namespace: namespace,
    collection: collection,
    repo: props.repository,
  };

  const table = {
    documentation: [] as DocsEntry[],
    modules: [] as DocsEntry[],
    roles: [] as DocsEntry[],
    plugins: [] as DocsEntry[],
    playbooks: [] as DocsEntry[],
  };

  table.documentation.push({
    display: t`Readme`,
    url: formatPath(Paths.collectionDocsIndexByRepo, baseUrlParams),
    type: 'docs',
    name: 'readme',
  });

  if (docs_blob.documentation_files) {
    for (const file of docs_blob.documentation_files) {
      const url = sanitizeDocsUrls(file.name);
      table.documentation.push({
        display: my_capitalize(file.name.split('.')[0].split('_').join(' ')),
        url: formatPath(Paths.collectionDocsPageByRepo, {
          ...baseUrlParams,
          page: url,
        }),
        // selected: selectedType === 'docs' && selectedName === url,
        type: 'docs',
        name: url,
      });
    }
  }

  if (docs_blob.contents) {
    for (const content of docs_blob.contents) {
      switch (content.content_type) {
        case 'role':
          table.roles.push(getContentEntry(content, baseUrlParams));
          break;
        case 'module':
          table.modules.push(getContentEntry(content, baseUrlParams));
          break;
        case 'playbook':
          table.playbooks.push(getContentEntry(content, baseUrlParams));
          break;
        default:
          table.plugins.push(getContentEntry(content, baseUrlParams));
          break;
      }
    }
  }

  // Sort docs
  for (const k of Object.keys(table)) {
    table[k].sort((a, b) => {
      // Make sure that anything starting with _ goes to the bottom
      // of the list
      if (a.display.startsWith('_') && !b.display.startsWith('_')) {
        return 1;
      }
      if (!a.display.startsWith('_') && b.display.startsWith('_')) {
        return -1;
      }
      return a.display > b.display ? 1 : -1;
    });
  }

  return table;
}

function renderLinks(
  links: DocsEntry[],
  title,
  filterString: string,
  collapsedCategories,
  props,
) {
  const isExpanded = !collapsedCategories.includes(title);
  const filteredLinks = links.filter((link) =>
    link.display.toLowerCase().includes(filterString.toLowerCase()),
  );
  return (
    <NavExpandable
      key={title}
      title={capitalize(`${title} (${filteredLinks.length})`)}
      isExpanded={isExpanded}
      isActive={getSelectedCategory(props) === title}
    >
      {filteredLinks.map((link: DocsEntry, index) => (
        <NavItem key={index} isActive={isSelected(link, props)}>
          <Link
            style={{
              textOverflow: 'ellipses',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            to={
              link.url +
              (Object.keys(props.params).length != 0
                ? '?' + ParamHelper.getQueryString(props.params)
                : '')
            }
          >
            <span
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {link.display}
            </span>
          </Link>
        </NavItem>
      ))}
    </NavExpandable>
  );
}

function isSelected(entry: DocsEntry, props): boolean {
  // the readme's url is always docs/, so load it when the name is null
  if (!props.selectedName && entry.name === 'readme') {
    return true;
  }

  return (
    // selected name and type are the values found for type and name
    // in the page url
    props.selectedName === entry.name && props.selectedType === entry.type
  );
}

function getSelectedCategory(props): string {
  const { selectedType } = props;
  if (!selectedType || selectedType === 'docs') {
    return 'documentation';
  }

  if (selectedType === 'role') {
    return 'roles';
  }

  if (selectedType === 'module') {
    return 'modules';
  }

  return 'plugins';
}

function my_capitalize(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

function getContentEntry(content, base): DocsEntry {
  return {
    display: content.content_name,
    url: formatPath(Paths.collectionContentDocsByRepo, {
      ...base,
      type: content.content_type,
      name: content.content_name,
    }),
    name: content.content_name,
    type: content.content_type,
  };
}
