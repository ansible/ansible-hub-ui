import React, { Component } from 'react';
import SmallLogoImage from 'src/../static/images/logo_small.svg';

interface IProps {
  alt: string;
}

export class SmallLogo extends Component<IProps> {
  render() {
    return (
      <img
        style={{ height: '35px' }}
        src={SmallLogoImage}
        alt={this.props.alt}
      />
    );
  }
}
