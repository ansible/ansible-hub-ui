import { t } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';

interface IProps {
  button?: boolean;
  next?: string;
}

export const LoginLink = ({ button, next }: IProps) => {
  const { featureFlags } = useContext();
  const className = button ? 'pf-c-button pf-m-primary' : '';

  // NOTE: also update AuthHandler#render (src/loaders/standalone/routes.tsx) when changing this
  if (featureFlags?.external_authentication && UI_EXTERNAL_LOGIN_URI) {
    return <a className={className} href={UI_EXTERNAL_LOGIN_URI}>{t`Login`}</a>;
  } else {
    return (
      <Link
        className={className}
        to={formatPath(Paths.login, {}, { next })}
      >{t`Login`}</Link>
    );
  }
};
