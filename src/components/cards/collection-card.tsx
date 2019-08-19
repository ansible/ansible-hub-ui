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

import { CertificateIcon } from '@patternfly/react-icons';

import { NumericLabel } from '../../components';
import { CollectionListType } from '../../api';

export class CollectionCard extends React.Component<CollectionListType> {
    MAX_DESCRIPTION_LENGTH = 60;

    render() {
        const { name, description, latest_version, namespace } = this.props;

        return (
            <Card className='collection-card-container'>
                <CardHead className='logo-row'>
                    <div className='image-container'>
                        <img
                            src={namespace.avatar_url}
                            alt={namespace.company + ' logo'}
                        />
                    </div>
                    <TextContent>
                        <Text component={TextVariants.small}>
                            <CertificateIcon className='icon' /> Certified
                        </Text>
                    </TextContent>
                </CardHead>
                <CardHead>
                    <div className='name'>{name}</div>
                    <div className='author'>
                        <TextContent>
                            <Text component={TextVariants.small}>
                                Provided by {namespace.company}
                            </Text>
                        </TextContent>
                    </div>
                </CardHead>
                <CardBody>
                    {this.getDescription(latest_version.metadata.description)}
                </CardBody>
                <CardFooter className='type-container'>
                    {Object.keys(latest_version.content_summary.contents).map(
                        k => {
                            return this.renderTypeCount(
                                k,
                                latest_version.content_summary.contents[k]
                                    .length,
                            );
                        },
                    )}
                </CardFooter>
            </Card>
        );
    }

    private getDescription(d: string) {
        if (d.length > this.MAX_DESCRIPTION_LENGTH) {
            return d.slice(0, this.MAX_DESCRIPTION_LENGTH) + '...';
        } else {
            return d;
        }
    }

    private renderTypeCount(type, count) {
        return (
            <div>
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
