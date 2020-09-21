import * as React from 'react';
// had to declare *.svg in src/index.d.ts
import LargeLogoImage from '../../../static/images/logo_large.svg';

interface IProps {
  // size should be css length measurment: '100px'
  size: string;
  image: string;
  alt: string;
  className?: string;
  unlockWidth?: boolean;
}

export class LargeLogo extends React.Component<IProps> {
  render() {
    const { size, image, alt, className, unlockWidth } = this.props;

    const style = {
      height: size,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

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
          src={image || LargeLogoImage}
          alt={alt}
        />
      </div>
    );
  }
}
