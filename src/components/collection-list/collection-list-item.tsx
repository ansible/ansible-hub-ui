import * as React from 'react';

import './list-item.scss';

import {
    Button,
    DataList,
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListCheck,
    DataListAction,
    DataListToggle,
    DataListContent,
    Dropdown,
    KebabToggle,
    DropdownItem,
} from '@patternfly/react-core';

import { Paths, formatPath } from '../../paths';
import { Link } from 'react-router-dom';
import { NumericLabel } from '../numeric-label/numeric-label';
import { CollectionList } from '../../api/response-types/collection';
import * as moment from 'moment';
import { Tag } from '../tags/tag';

export class CollectionListItem extends React.Component<CollectionList, {}> {
    render() {
        const { name, download_count, latest_version, namespace } = this.props;

        return (
            <DataListItem aria-labelledby='simple-item1'>
                <DataListItemRow>
                    <DataListItemCells
                        dataListCells={[
                            <DataListCell key='primary content'>
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
                                    {latest_version.metadata.tags.map(tag => (
                                        <Tag>{tag}</Tag>
                                    ))}
                                </div>
                                <div className='entry pf-l-flex pf-m-wrap'>
                                    {Object.keys(
                                        latest_version.content_summary.contents,
                                    ).map(k => {
                                        return (
                                            <div>
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
                                key='secondary content align'
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
