import * as React from 'react';

interface IProps {
    children: string;
}

export class Tag extends React.Component<IProps, {}> {
    render() {
        return (
            <div
                style={{
                    display: 'inline-block',
                    margin: '4px',
                    backgroundColor: '#E8E6E6',
                    fontSize: '14px',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                    paddingBottom: '2px',
                    paddingTop: '2px',
                    borderRadius: '3px',
                }}
            >
                {this.props.children}
            </div>
        );
    }
}
