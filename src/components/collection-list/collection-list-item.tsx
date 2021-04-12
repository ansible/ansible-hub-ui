import * as React from 'react';
import './list-item.scss';

import {
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import { Link } from 'react-router-dom';
import * as moment from 'moment';

import { Paths, formatPath } from 'src/paths';
import { NumericLabel, Tag, Logo, DeprecatedTag } from 'src/components';
import { CollectionListType } from 'src/api';
import { convertContentSummaryCounts } from 'src/utilities';

interface IProps extends CollectionListType {
  showNamespace?: boolean;
  controls?: React.ReactNode;
  repo?: string;
}

export class CollectionListItem extends React.Component<IProps, {}> {
  render() {
    const {
      name,
      // download_count,
      latest_version,
      namespace,
      showNamespace,
      controls,
      deprecated,
      repo,
    } = this.props;

    const cells = [];

    const company = namespace.company || namespace.name;

    if (showNamespace) {
      cells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns'>
          <Logo
            alt={company + ' logo'}
            image={namespace.avatar_url}
            size='50px'
          />
        </DataListCell>,
      );
    }

    const contentSummary = convertContentSummaryCounts(
      latest_version.metadata.contents,
    );

    cells.push(
      <DataListCell key='content'>
        <div>
          <Link
            to={formatPath(Paths.collectionByRepo, {
              collection: name,
              namespace: namespace.name,
              repo: repo,
            })}
          >
            {name}
          </Link>
          {deprecated && <DeprecatedTag />}
          {showNamespace ? (
            <TextContent>
              <Text component={TextVariants.small}>Provided by {company}</Text>
            </TextContent>
          ) : null}
        </div>
        <div className='entry'>{latest_version.metadata.description}</div>
        <div className='entry pf-l-flex pf-m-wrap content'>
          {Object.keys(contentSummary.contents).map(k => (
            <div key={k}>
              <NumericLabel label={k} number={contentSummary.contents[k]} />
            </div>
          ))}
        </div>
        <div className='entry pf-l-flex pf-m-wrap'>
          {latest_version.metadata.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </div>
      </DataListCell>,
    );

    cells.push(
      <DataListCell isFilled={false} alignRight key='stats'>
        {controls ? <div className='entry'>{controls}</div> : null}
        <div className='right-col entry'>
          Updated {moment(latest_version.created_at).fromNow()}
        </div>
        <div className='entry'>v{latest_version.version}</div>
      </DataListCell>,
    );

    return (
      <DataListItem aria-labelledby='simple-item1'>
        <DataListItemRow>
          <DataListItemCells dataListCells={cells} />
        </DataListItemRow>
      </DataListItem>
    );
  }
}
