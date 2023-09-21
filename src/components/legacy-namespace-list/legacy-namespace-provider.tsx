import React from 'react';
import {
    Text,
    TextContent,
    TextVariants
} from '@patternfly/react-core';
import { Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';


interface IProps {
    id: number;
    name: string;
    url: string;
}

export class ProviderLink extends React.Component<IProps> {

    constructor(props) {
        super(props);
    }

    render () {

        const {
            id,
            name,
            url,
        } = this.props;

        return (
              <TextContent>
                <Text component={TextVariants.small}>
                  <Trans>
                    Provided by <Link to={url}>{name}</Link>
                  </Trans>
                </Text>
              </TextContent>
        )
    }
}
