import React, { useState } from 'react';
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

export const Logo = (props: IProps) => {
  const [failed, setFailed] = useState(false);

  const {
    alt,
    className,
    fallbackToDefault,
    image,
    size,
    unlockWidth,
    width,
    flexGrow,
  } = props;

  const style = {
    height: size,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: width,
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
        onError={fallbackToDefault ? () => setFailed(true) : () => null}
      />
    </div>
  );
};
