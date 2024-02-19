import React from 'react';
// had to declare *.svg in src/index.d.ts
import DefaultLogo from 'src/../static/images/default-logo.svg';

interface IProps {
  // size should be css length measurment: '100px'
  size: string;
  width?: string;
  image: string;
  alt: string;
  className?: string;
  unlockWidth?: boolean;
  fallbackToDefault?: boolean;
  flexGrow?: boolean;
}

interface IState {
  failed: boolean;
}

export class Logo extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  render() {
    const {
      alt,
      className,
      fallbackToDefault,
      image,
      size,
      unlockWidth,
      width,
      flexGrow,
    } = this.props;
    const { failed } = this.state;

    const style = {
      height: size,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width,
    };

    if (flexGrow) {
      style['flexGrow'] = 1;
    }

    if (unlockWidth) {
      style['minWidth'] = size;
    } else {
      style['width'] = size;
    }

    // use inline css so we can set size
    return (
      <div className={className} style={style}>
        <img
          style={{ objectFit: 'contain', maxHeight: size }}
          src={failed ? DefaultLogo : image || DefaultLogo}
          alt={alt}
          onError={
            fallbackToDefault
              ? () => this.setState({ failed: true })
              : () => null
          }
        />
      </div>
    );
  }
}
