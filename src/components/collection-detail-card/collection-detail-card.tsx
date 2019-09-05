import * as React from 'react';
import './collection-detail-card.scss';

import { Link } from 'react-router-dom';

import {
    ClipboardCopy,
    Split,
    SplitItem,
    Grid,
    GridItem,
} from '@patternfly/react-core';

import { CollectionDetailType } from '../../api';
import { Tag } from '../../components';
import { Paths, formatPath } from '../../paths';

export class CollectionDetailCard extends React.Component<
    CollectionDetailType
> {
    render() {
        const {
            name,
            description,
            download_count,
            latest_version,
            namespace,
        } = this.props;

        console.log(this.props);

        const installCommand = `ansible-galaxy install ${namespace.name}.${name}`;

        return (
            <div className='pf-c-content'>
                <h1>Info</h1>
                <Grid gutter='lg'>
                    <GridItem>{description}</GridItem>
                    <GridItem>
                        {latest_version.metadata.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                        ))}
                    </GridItem>
                    <GridItem>
                        <Split gutter='sm'>
                            <SplitItem className='install-title'>
                                Installation
                            </SplitItem>
                            <SplitItem isFilled>
                                <ClipboardCopy>{installCommand}</ClipboardCopy>
                            </SplitItem>
                        </Split>
                    </GridItem>
                    <GridItem>
                        <Split gutter='sm'>
                            <SplitItem className='install-tile'>
                                Install Version
                            </SplitItem>
                            <SplitItem isFilled>
                                Dropdown blocked as part of #16
                            </SplitItem>
                        </Split>
                    </GridItem>

                    <GridItem>
                        <div className='readme-container'>
                            <div
                                className='pf-c-content'
                                dangerouslySetInnerHTML={{
                                    __html:
                                        latest_version.docs_blob
                                            .collection_readme.html,
                                }}
                            />
                            <div className='fade-out'></div>
                        </div>
                        <Link
                            to={formatPath(Paths.collectionDocsIndex, {
                                collection: name,
                                namespace: namespace.name,
                            })}
                        >
                            Load full readme
                        </Link>
                    </GridItem>
                </Grid>
            </div>
        );
    }
}
