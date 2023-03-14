import * as React from 'react';
import SmallLogoImage from 'src/../static/images/logo_small.svg';

interface IProps {
  alt: string;
}

export const SmallLogo = (props: IProps) => {
  return (
    <img style={{ height: '35px' }} src={SmallLogoImage} alt={props.alt} />
  );
};
