import * as React from 'react';
import {
    Card,
    CardHead,
    CardBody,
    CardFooter,
    TextContent,
    Text,
    TextVariants,
} from '@patternfly/react-core';

import { Link } from 'react-router-dom';

import { CertificateIcon } from '@patternfly/react-icons';

import { NumericLabel, Logo } from '../../components';
import { CollectionListType } from '../../api';
import { formatPath, Paths } from '../../paths';
import { convertContentSummaryCounts } from '../../utilities';

interface IProps extends CollectionListType {
    className?: string;
}

export class CollectionCard extends React.Component<IProps> {
    MAX_DESCRIPTION_LENGTH = 50;

    render() {
        const { name, latest_version, namespace, className } = this.props;

        const company = namespace.company || namespace.name;
        const contentSummary = convertContentSummaryCounts(
            latest_version.contents,
        );

        return (
            <Card className={'collection-card-container ' + className}>
                <CardHead className='logo-row'>
                    <Logo
                        image={namespace.avatar_url}
                        alt={company + ' logo'}
                        size='40px'
                    />
                    <TextContent>
                        <Text component={TextVariants.small}>
                            <CertificateIcon className='icon' /> Certified
                        </Text>
                    </TextContent>
                </CardHead>
                <CardHead>
                    <div className='name'>
                        <Link
                            to={formatPath(Paths.collection, {
                                collection: name,
                                namespace: namespace.name,
                            })}
                        >
                            {name}
                        </Link>
                    </div>
                    <div className='author'>
                        <TextContent>
                            <Text component={TextVariants.small}>
                                Provided by {company}
                            </Text>
                        </TextContent>
                    </div>
                </CardHead>
                <CardBody className='description'>
                    {this.getDescription(latest_version.metadata.description)}
                </CardBody>
                <CardFooter className='type-container'>
                    {Object.keys(contentSummary.contents).map(k =>
                        this.renderTypeCount(k, contentSummary.contents[k]),
                    )}
                </CardFooter>
            </Card>
        );
    }

    private getDescription(d: string) {
        if (!d) {
            return '';
        }
        if (d.length > this.MAX_DESCRIPTION_LENGTH) {
            return d.slice(0, this.MAX_DESCRIPTION_LENGTH) + '...';
        } else {
            return d;
        }
    }

    private renderTypeCount(type, count) {
        return (
            <div key={type}>
                <div>
                    <NumericLabel number={count} />
                </div>
                <div className='type-label'>
                    <NumericLabel
                        number={count}
                        hideNumber={true}
                        label={type}
                    />
                </div>
            </div>
        );
    }
}
