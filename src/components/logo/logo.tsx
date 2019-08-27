import * as React from 'react';

interface IProps {
    // size should be css length measurment: '100px'
    size: string;
    image: string;
    alt: string;
    className?: string;
}

export class Logo extends React.Component<IProps> {
    render() {
        const { size, image, alt, className } = this.props;

        // use inline css so we can set size
        return (
            <div
                className={className}
                style={{
                    width: size,
                    height: size,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <img
                    style={{ objectFit: 'contain', maxHeight: size }}
                    src={image}
                    alt={alt}
                />
            </div>
        );
    }
}
