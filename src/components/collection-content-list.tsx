import { t } from '@lingui/macro';
import { Toolbar, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import cx from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import { type CollectionVersionSearch, type ContentSummaryType } from 'src/api';
import { EmptyStateCustom, SearchInput } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper } from 'src/utilities';
import './collection-content-list.scss';

interface IProps {
  contents: ContentSummaryType[];
  collection: CollectionVersionSearch;
  params: {
    keywords?: string;
    showing?: string;
  };
  updateParams: (p) => void;
}

export const CollectionContentList = ({
  contents,
  collection,
  params,
  updateParams,
}: IProps) => {
  const ignoredParams = ['keywords', 'showing'];

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

  const { collection_version, repository } = collection;

  return (
    <div>
      <div>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarItem>
              <SearchInput
                value={params.keywords || ''}
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
      <Table variant='compact'>
        <Thead>
          <Tr>
            <Th>{t`Name`}</Th>
            <Th>{t`Type`}</Th>
            <Th>{t`Description`}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {toShow.map((content, i) => (
            <Tr key={i}>
              <Td>
                <Link
                  to={formatPath(
                    Paths.collectionContentDocsByRepo,
                    {
                      collection: collection_version.name,
                      namespace: collection_version.namespace,
                      type: content.content_type,
                      name: content.name,
                      repo: repository.name,
                    },
                    ParamHelper.getReduced(params, ignoredParams),
                  )}
                >
                  {content.name}
                </Link>
              </Td>
              <Td>{content.content_type}</Td>
              <Td>{content.description}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {summary.all <= 0 &&
        repository.name === 'community' &&
        renderCommunityWarningMessage()}
    </div>
  );
};

function renderCommunityWarningMessage() {
  return (
    <EmptyStateCustom
      title={t`Warning`}
      description={t`Community collections do not have docs nor content counts, but all content gets synchronized`}
      icon={ExclamationTriangleIcon}
    />
  );
}
