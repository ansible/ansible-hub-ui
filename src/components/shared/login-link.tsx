import * as React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@lingui/macro';
import { Paths, formatPath } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

interface IProps {
  button?: boolean;
  next?: string;
}

export class LoginLink extends React.Component<IProps> {
  static contextType = AppContext;

  render() {
    const { button, next } = this.props;
    const { featureFlags } = this.context;
    const className = button ? 'pf-c-button pf-m-primary' : '';

    // NOTE: also update AuthHandler#render (src/loaders/standalone/routes.tsx) when changing this
    if (featureFlags?.external_authentication && UI_EXTERNAL_LOGIN_URI) {
      return (
        <a className={className} href={UI_EXTERNAL_LOGIN_URI}>{t`Login`}</a>
      );
    } else {
      return (
        <Link
          className={className}
          to={formatPath(Paths.login, {}, { next })}
        >{t`Login`}</Link>
      );
    }
  }
}
