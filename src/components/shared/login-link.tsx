import * as React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';

interface IProps {
  button?: boolean;
  next?: string;
}

export class LoginLink extends React.Component<IProps> {
  render() {
    const { button, next } = this.props;
    const className = button ? 'pf-c-button pf-m-primary' : '';

    return (
      <Link
        className={className}
        to={formatPath(Paths.login, {}, { next })}
      >{t`Login`}</Link>
    );
  }
}
