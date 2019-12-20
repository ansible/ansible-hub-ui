import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { Paths } from '../../paths';

interface IProps {
    style?: Object;
    className?: string;
}

export class APIButton extends React.Component<IProps> {
    render() {
        return (
            <div className={this.props.className} style={this.props.style}>
                <Link to={Paths.token} target='_blank'>
                    <Button variant='secondary' isInline>
                        Get API token
                    </Button>
                </Link>
            </div>
        );
    }
}
