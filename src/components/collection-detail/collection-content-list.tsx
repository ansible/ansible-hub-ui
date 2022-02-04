import { t } from '@lingui/macro';
import * as React from 'react';
import cx from 'classnames';
import './collection-content-list.scss';

import { Link } from 'react-router-dom';
import {
  SearchInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import { EmptyStateCustom } from 'src/components';

import { ContentSummaryType } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper } from 'src/utilities/param-helper';
import { AppContext } from 'src/loaders/app-context';

interface IProps {
  contents: ContentSummaryType[];
  collection: string;
  namespace: string;
  params: {
    keywords?: string;
    showing?: string;
  };
  updateParams: (p) => void;
}

export class CollectionContentList extends React.Component<IProps> {
  ignoredParams = ['keywords', 'showing'];
  static contextType = AppContext;

  render() {
    const { contents, collection, namespace, params, updateParams } =
      this.props;

    const toShow: ContentSummaryType[] = [];
    const summary = { all: 0 };
    const showing = params.showing || 'all';
    const keywords = params.keywords || '';

    for (const c of contents) {
      summary[c.content_type] ||= 0;

      const keywordMatch = c.name.match(keywords);
      const typeMatch = showing === 'all' ? true : c.content_type === showing;

      // count only items matching keyword
      if (keywordMatch) {
        summary[c.content_type]++;
        summary['all']++;
      }

      // show only items matching keyword + type
      if (keywordMatch && typeMatch) {
        toShow.push(c);
      }
    }

    return (
      <div>
        <div>
          <Toolbar>
            <ToolbarGroup>
              <ToolbarItem>
                <SearchInput
                  value={params.keywords || ''}
                  onChange={(val) =>
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
            <ToolbarGroup>
              <ToolbarItem>{t`Showing:`}</ToolbarItem>
              {Object.keys(summary).map((key) => (
                <ToolbarItem
                  key={key}
                  className={cx({
                    clickable: true,
                    'hub-c-toolbar__item-selected-item': key === showing,
                    'hub-c-toolbar__item-type-selector': true,
                  })}
                  onClick={() =>
                    updateParams(ParamHelper.setParam(params, 'showing', key))
                  }
                >
                  {key} ({summary[key]})
                </ToolbarItem>
              ))}
            </ToolbarGroup>
          </Toolbar>
        </div>
        <table className='hub-c-table-content pf-c-table pf-m-compact'>
          <thead>
            <tr>
              <th>{t`Name`}</th>
              <th>{t`Type`}</th>
              <th>{t`Description`}</th>
            </tr>
          </thead>
          <tbody>
            {toShow.map((content, i) => (
              <tr key={i}>
                <td>
                  <Link
                    to={formatPath(
                      Paths.collectionContentDocsByRepo,
                      {
                        collection: collection,
                        namespace: namespace,
                        type: content.content_type,
                        name: content.name,
                        repo: this.context.selectedRepo,
                      },
                      ParamHelper.getReduced(params, this.ignoredParams),
                    )}
                  >
                    {content.name}
                  </Link>
                </td>
                <td>{content.content_type}</td>
                <td>{content.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {summary.all <= 0 &&
          this.context.selectedRepo === 'community' &&
          this.renderCommunityWarningMessage()}
      </div>
    );
  }

  private renderCommunityWarningMessage() {
    return (
      <EmptyStateCustom
        title={t`Warning`}
        description={t`Community collections do not have docs nor content counts, but all content gets synchronized`}
        icon={ExclamationTriangleIcon}
      />
    );
  }
}
