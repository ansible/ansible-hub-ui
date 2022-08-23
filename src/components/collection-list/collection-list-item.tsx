import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import './list-item.scss';

import {
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  LabelGroup,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import { Link } from 'react-router-dom';

import { Paths, formatPath } from 'src/paths';
import {
  CollectionNumericLabel,
  Tag,
  Logo,
  DeprecatedTag,
  DateComponent,
} from 'src/components';
import { CollectionListType } from 'src/api';
import { convertContentSummaryCounts } from 'src/utilities';
import { SignatureBadge } from '../signing';

interface IProps extends CollectionListType {
  showNamespace?: boolean;
  controls?: React.ReactNode;
  repo?: string;
}

export class CollectionListItem extends React.Component<IProps> {
  render() {
    const {
      name,
      latest_version,
      namespace,
      showNamespace,
      controls,
      deprecated,
      repo,
      sign_state,
    } = this.props;

    const cells = [];

    const company = namespace.company || namespace.name;

    if (showNamespace) {
      cells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns'>
          <Logo
            alt={t`${company} logo`}
            fallbackToDefault
            image={namespace.avatar_url}
            size='40px'
            unlockWidth
            width='97px'
          />
        </DataListCell>,
      );
    }

    const contentSummary = convertContentSummaryCounts(latest_version.metadata);

    cells.push(
      <DataListCell key='content'>
        <div>
          <Link
            to={formatPath(Paths.collectionByRepo, {
              collection: name,
              namespace: namespace.name,
              repo: repo,
            })}
            data-cy='CollectionList-name'
          >
            {name}
          </Link>
          {deprecated && <DeprecatedTag />}
          {showNamespace ? (
            <TextContent>
              <Text component={TextVariants.small}>
                <Trans>Provided by {company}</Trans>
              </Text>
            </TextContent>
          ) : null}
        </div>
        <div className='hub-entry'>{latest_version.metadata.description}</div>
        <div className='hub-entry pf-l-flex pf-m-wrap'>
          {Object.keys(contentSummary.contents).map((type) => (
            <div key={type}>
              <CollectionNumericLabel
                count={contentSummary.contents[type]}
                type={type}
              />
            </div>
          ))}
        </div>
        <div className='hub-entry pf-l-flex pf-m-wrap'>
          <LabelGroup>
            {latest_version.metadata.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </LabelGroup>
        </div>
      </DataListCell>,
    );

    cells.push(
      <DataListCell isFilled={false} alignRight key='stats'>
        {controls ? <div className='hub-entry'>{controls}</div> : null}
        <div className='hub-right-col hub-entry'>
          <Trans>
            Updated <DateComponent date={latest_version.created_at} />
          </Trans>
        </div>
        <div className='hub-entry'>v{latest_version.version}</div>
        <SignatureBadge className='hub-entry' signState={sign_state} />
      </DataListCell>,
    );

    return (
      <DataListItem data-cy='CollectionListItem'>
        <DataListItemRow>
          <DataListItemCells dataListCells={cells} />
        </DataListItemRow>
      </DataListItem>
    );
  }
}
