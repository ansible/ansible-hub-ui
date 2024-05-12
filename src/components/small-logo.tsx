import React from 'react';
import SmallLogoImage from 'static/images/logo_small.svg';

interface IProps {
  alt: string;
}

export const SmallLogo = ({ alt }: IProps) => (
  <img style={{ height: '35px' }} src={SmallLogoImage} alt={alt} />
);
