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

import { Paths, formatPath } from '../../paths';
import { NumericLabel, Tag, Logo } from '../../components';
import { CollectionListType } from '../../api';

interface IProps extends CollectionListType {
    showNamespace?: boolean;
}

export class CollectionListItem extends React.Component<IProps, {}> {
    render() {
        const {
            name,
            download_count,
            latest_version,
            namespace,
            showNamespace,
        } = this.props;

        const cells = [];

        if (showNamespace) {
            cells.push(
                <DataListCell isFilled={false} alignRight={false} key='ns'>
                    <Logo
                        alt={namespace.company + ' logo'}
                        image={namespace.avatar_url}
                        size='50px'
                    />
                </DataListCell>,
            );
        }

        cells.push(
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
                    {showNamespace ? (
                        <TextContent>
                            <Text component={TextVariants.small}>
                                Provided by {namespace.company}
                            </Text>
                        </TextContent>
                    ) : null}
                </div>
                <div className='entry'>
                    {latest_version.metadata.description}
                </div>
                <div className='entry pf-l-flex pf-m-wrap'>
                    {latest_version.metadata.tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                    ))}
                </div>
                <div className='entry pf-l-flex pf-m-wrap'>
                    {Object.keys(latest_version.content_summary.contents).map(
                        k => {
                            return (
                                <div key={k}>
                                    <NumericLabel
                                        label={k}
                                        number={
                                            latest_version.content_summary
                                                .contents[k].length
                                        }
                                    />
                                </div>
                            );
                        },
                    )}
                </div>
            </DataListCell>,
        );

        cells.push(
            <DataListCell isFilled={false} alignRight key='stats'>
                <div className='right-col entry'>
                    <NumericLabel number={download_count} label='Download' />
                </div>
                <div className='entry'>
                    Updated {moment(latest_version.created).fromNow()}
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
