import * as React from 'react';

import { capitalize } from 'lodash';
import { Link } from 'react-router-dom';

import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  TextInput,
} from '@patternfly/react-core';

import { DocsBlobType } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, sanitizeDocsUrls } from 'src/utilities';
import { AppContext } from 'src/loaders/app-context';

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

interface IState {
  collapsedCategories: string[];
  searchBarValue: string;
}

interface IProps {
  docs_blob: DocsBlobType;
  namespace: string;
  collection: string;
  params: object;
  selectedName?: string;
  selectedType?: string;
  className?: string;
}

export class TableOfContents extends React.Component<IProps, IState> {
  docsBlobCache: DocsBlobType;
  tableCache: Table;
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = { collapsedCategories: [], searchBarValue: '' };
  }

  render() {
    const { className, docs_blob } = this.props;

    // There's a lot of heavy processing that goes into formatting the table
    // variable. To prevent running everything each time the component renders,
    // cache the value as an object property.
    // This is a lazy anti pattern. I should be using memoization or something
    // like that, but the react docs recommend using a third party memoization
    // library and I am not going to add extra dependencies just for this
    // component https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization

    if (!this.tableCache || this.docsBlobCache !== docs_blob) {
      this.tableCache = this.parseLinks(docs_blob);
      this.docsBlobCache = docs_blob;
    }

    const table = this.tableCache;

    return (
      <div className={className}>
        <TextInput
          value={this.state.searchBarValue}
          onChange={val => this.setState({ searchBarValue: val })}
          aria-label='find-content'
          placeholder='Filter by keyword'
        />
        <Nav theme='light'>
          <NavList>
            {Object.keys(table).map(key =>
              table[key].length === 0
                ? null
                : this.renderLinks(table[key], key, this.state.searchBarValue),
            )}
          </NavList>
        </Nav>
      </div>
    );
  }

  private parseLinks(docs_blob: DocsBlobType): Table {
    const { namespace, collection } = this.props;

    const baseUrlParams = {
      namespace: namespace,
      collection: collection,
      repo: this.context.selectedRepo,
    };

    const table = {
      documentation: [] as DocsEntry[],
      modules: [] as DocsEntry[],
      roles: [] as DocsEntry[],
      plugins: [] as DocsEntry[],
      playbooks: [] as DocsEntry[],
    };

    table.documentation.push({
      display: 'Readme',
      url: formatPath(Paths.collectionDocsIndexByRepo, baseUrlParams),
      type: 'docs',
      name: 'readme',
    });

    if (docs_blob.documentation_files) {
      for (const file of docs_blob.documentation_files) {
        const url = sanitizeDocsUrls(file.name);
        table.documentation.push({
          display: this.capitalize(
            file.name
              .split('.')[0]
              .split('_')
              .join(' '),
          ),
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
            table.roles.push(this.getContentEntry(content, baseUrlParams));
            break;
          case 'module':
            table.modules.push(this.getContentEntry(content, baseUrlParams));
            break;
          case 'playbook':
            table.playbooks.push(this.getContentEntry(content, baseUrlParams));
            break;
          default:
            table.plugins.push(this.getContentEntry(content, baseUrlParams));
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

  private renderLinks(links: DocsEntry[], title, filterString: string) {
    const isExpanded = !this.state.collapsedCategories.includes(title);
    const filteredLinks = links.filter(
      link => link.display.indexOf(filterString) > -1,
    );
    return (
      <NavExpandable
        key={title}
        title={capitalize(`${title} (${links.length})`)}
        isExpanded={isExpanded}
        isActive={this.getSelectedCategory() === title}
      >
        {filteredLinks.map((link: DocsEntry, index) => (
          <NavItem key={index} isActive={this.isSelected(link)}>
            <Link
              style={{
                textOverflow: 'ellipses',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              to={
                link.url +
                (Object.keys(this.props.params).length != 0
                  ? '?' + ParamHelper.getQueryString(this.props.params)
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

  private isSelected(entry: DocsEntry): boolean {
    // the readme's url is always docs/, so load it when the name is null
    if (!this.props.selectedName && entry.name === 'readme') {
      return true;
    }

    return (
      // selected name and type are the values found for type and name
      // in the page url
      this.props.selectedName === entry.name &&
      this.props.selectedType === entry.type
    );
  }

  private getSelectedCategory(): string {
    const { selectedType } = this.props;
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

  private capitalize(s: string) {
    return s.slice(0, 1).toUpperCase() + s.slice(1);
  }

  private getContentEntry(content, base): DocsEntry {
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
}
