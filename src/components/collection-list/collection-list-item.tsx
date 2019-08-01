import * as React from 'react';

import './list-item.scss';

import {
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
} from '@patternfly/react-core';

import { Paths, formatPath } from '../../paths';
import { Link } from 'react-router-dom';
import { NumericLabel } from '../numeric-label/numeric-label';
import { CollectionListType } from '../../api';
import * as moment from 'moment';
import { Tag } from '../tags/tag';

export class CollectionListItem extends React.Component<
    CollectionListType,
    {}
> {
    render() {
        const { name, download_count, latest_version, namespace } = this.props;

        return (
            <DataListItem aria-labelledby='simple-item1'>
                <DataListItemRow>
                    <DataListItemCells
                        dataListCells={[
                            <DataListCell key='content'>
                                <div>
                                    <Link
                                        to={formatPath(Paths.collection, {
                                            namespace: namespace.name,
                                            collection: name,
                                        })}
                                    >
                                        {name}
                                    </Link>
                                </div>
                                <div className='entry'>
                                    {latest_version.metadata.description}
                                </div>
                                <div className='entry pf-l-flex pf-m-wrap'>
                                    {latest_version.metadata.tags.map(
                                        (tag, index) => (
                                            <Tag key={index}>{tag}</Tag>
                                        ),
                                    )}
                                </div>
                                <div className='entry pf-l-flex pf-m-wrap'>
                                    {Object.keys(
                                        latest_version.content_summary.contents,
                                    ).map(k => {
                                        return (
                                            <div key={k}>
                                                <NumericLabel
                                                    label={k}
                                                    number={
                                                        latest_version
                                                            .content_summary
                                                            .contents[k].length
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </DataListCell>,
                            <DataListCell
                                isFilled={false}
                                alignRight
                                key='stats'
                            >
                                <div className='right-col entry'>
                                    <NumericLabel
                                        number={download_count}
                                        label='Download'
                                    />
                                </div>
                                <div className='entry'>
                                    Updated{' '}
                                    {moment(latest_version.created).fromNow()}
                                </div>
                                <div className='entry'>
                                    v{latest_version.version}
                                </div>
                            </DataListCell>,
                        ]}
                    />
                </DataListItemRow>
            </DataListItem>
        );
    }
}
