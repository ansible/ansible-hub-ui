import { t } from '@lingui/macro';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { useHubContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { loginURL } from 'src/utilities';

interface IProps {
  button?: boolean;
}

export const LoginLink = ({ button }: IProps) => {
  const { featureFlags } = useHubContext();
  const { pathname } = useLocation();

  const className = button ? 'pf-v5-c-button pf-m-primary' : '';

  // NOTE: also update AuthHandler#render (src/loaders/standalone/routes.tsx) when changing this
  if (featureFlags?.external_authentication && UI_EXTERNAL_LOGIN_URI) {
    return (
      <a
        className={className}
        href={loginURL(pathname, featureFlags)}
      >{t`Login`}</a>
    );
  } else {
    return (
      <Link
        className={className}
        to={formatPath(Paths.login, {}, { next: pathname })}
      >{t`Login`}</Link>
    );
  }
};
