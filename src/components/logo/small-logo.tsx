import * as React from 'react';
import SmallLogoImage from '../../../static/images/logo_small.svg';

interface IProps {
  alt: string;
}

export class SmallLogo extends React.Component<IProps> {
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
