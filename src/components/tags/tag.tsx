import * as React from 'react';

import { Text, TextVariants } from '@patternfly/react-core';

interface IProps {
    children: string;
}

export class Tag extends React.Component<IProps, {}> {
    render() {
        return (
            <div
                style={{
                    display: 'inline-block',
                    backgroundColor: '#E8E6E6',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                }}
            >
                <Text component={TextVariants.small}>
                    {this.props.children}
                </Text>
            </div>
        );
    }
}
