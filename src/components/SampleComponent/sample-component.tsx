import './sample-component.scss';
import * as React from 'react';

/**
 * This is a dumb component that only recieves properties from a smart component.
 * Dumb components are usually functions and not classes.
 *
 * @param props the props given by the smart component.
 */

interface IProps {
    children: any;
}

export class SampleComponent extends React.Component<IProps, {}> {
    render() {
        return (
            <span className="sample-component"> {this.props.children} </span>
        );
    }
}
