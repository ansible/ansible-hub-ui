import * as React from 'react';
import './collection-info.scss';

import * as moment from 'moment';
import { Link } from 'react-router-dom';

import {
    ClipboardCopy,
    Split,
    SplitItem,
    Grid,
    GridItem,
    FormSelect,
    FormSelectOption,
} from '@patternfly/react-core';

import { CollectionDetailType } from '../../api';
import { Tag } from '../../components';
import { Paths, formatPath } from '../../paths';
import { ParamHelper } from '../../utilities/param-helper';

interface IProps extends CollectionDetailType {
    params: {
        version?: string;
    };
    updateParams: (params) => void;
}

export class CollectionInfo extends React.Component<IProps> {
    render() {
        const {
            name,
            description,
            latest_version,
            namespace,
            all_versions,
            params,
            updateParams,
        } = this.props;

        let installCommand = `ansible-galaxy install ${namespace.name}.${name}`;

        if (params.version) {
            installCommand += `,version=${params.version}`;
        }

        return (
            <div className='pf-c-content info-panel'>
                <h1>Info</h1>
                <Grid gutter='lg'>
                    <GridItem>{description}</GridItem>
                    <GridItem>
                        {latest_version.metadata.tags.map((tag, i) => (
                            <Tag key={i}>{tag}</Tag>
                        ))}
                    </GridItem>

                    <GridItem>
                        <Split gutter='sm'>
                            <SplitItem className='install-title'>
                                License
                            </SplitItem>
                            <SplitItem isFilled>
                                {latest_version.metadata.license}
                            </SplitItem>
                        </Split>
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
                                <FormSelect
                                    onChange={val =>
                                        updateParams(
                                            ParamHelper.setParam(
                                                params,
                                                'version',
                                                val,
                                            ),
                                        )
                                    }
                                    value={
                                        params.version
                                            ? params.version
                                            : latest_version.version
                                    }
                                    aria-label='Select collection version'
                                >
                                    {all_versions.map(v => (
                                        <FormSelectOption
                                            key={v.version}
                                            value={v.version}
                                            label={`${
                                                v.version
                                            } released ${moment(
                                                v.created,
                                            ).fromNow()} ${
                                                v.version ===
                                                latest_version.version
                                                    ? '(latest)'
                                                    : ''
                                            }`}
                                        />
                                    ))}
                                </FormSelect>
                            </SplitItem>
                        </Split>
                    </GridItem>

                    {latest_version.docs_blob.collection_readme ? (
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
                                to={formatPath(
                                    Paths.collectionDocsIndex,
                                    {
                                        collection: name,
                                        namespace: namespace.name,
                                    },
                                    params,
                                )}
                            >
                                Load full readme
                            </Link>
                        </GridItem>
                    ) : null}
                </Grid>
            </div>
        );
    }
}
