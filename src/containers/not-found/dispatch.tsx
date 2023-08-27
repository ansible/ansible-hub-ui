import { Trans, t } from '@lingui/macro';
import { Bullseye, DataList } from '@patternfly/react-core';
import React, { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NotFoundImage from 'src/../static/images/not_found.svg';
import { CollectionVersionAPI, LegacyRoleAPI } from 'src/api';
import {
  BaseHeader,
  CollectionListItem,
  EmptyStateNoData,
  LegacyRoleListItem,
  LoadingPageSpinner,
  Main,
} from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, RouteProps, withRouter } from 'src/utilities';

const PageSection = ({ children, ...rest }: { children: ReactNode }) => (
  <section className='body' {...rest}>
    {children}
  </section>
);

const SectionSeparator = () => <section>&nbsp;</section>;

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className='pf-c-title'>{children}</h2>
);

export const Dispatch = (props: RouteProps) => {
  const { featureFlags } = useContext();

  const { pathname } = ParamHelper.parseParamString(props.location.search) as {
    pathname: string;
  };

  const [namespace, name] = pathname.split('/').filter(Boolean);

  const [collections, setCollections] = useState(null);
  const [roles, setRoles] = useState(null);

  useEffect(() => {
    CollectionVersionAPI.list({ namespace, name, is_highest: true })
      .then(({ data: { data } }) => setCollections(data || []))
      .catch(() => setCollections([]));

    if (featureFlags.legacy_roles) {
      LegacyRoleAPI.list({ github_user: namespace, name })
        .then(({ data: { results } }) => setRoles(results || []))
        .catch(() => setRoles([]));
    }
  }, [pathname]);

  return (
    <>
      <BaseHeader title={t`404 - Page not found`} />
      <Main>
        <PageSection>
          <Bullseye>
            <div className='hub-c-bullseye__center'>
              <img src={NotFoundImage} alt={t`Not found`} width='128px' />
              <div>{t`We couldn't find the page you're looking for!`}</div>
              <div className='pf-c-content'>
                <Trans>
                  Pathname{' '}
                  <pre style={{ display: 'inline-block' }}>{pathname}</pre>{' '}
                  could refer to a collection or a role.
                </Trans>{' '}
                {featureFlags.legacy_roles ? null : (
                  <Trans>Roles are not currently enabled.</Trans>
                )}
              </div>
            </div>
          </Bullseye>
        </PageSection>
        <SectionSeparator />
        <PageSection>
          <SectionTitle>{t`Collections`}</SectionTitle>

          {collections === null ? (
            <LoadingPageSpinner />
          ) : collections.length === 0 ? (
            <EmptyStateNoData
              title={t`No matching collections found.`}
              description={
                <Link
                  to={formatPath(Paths.collections)}
                >{t`Show all collections`}</Link>
              }
            />
          ) : (
            <>
              <DataList aria-label={t`Available matching collections`}>
                {collections.map((c, i) => (
                  <CollectionListItem
                    key={i}
                    collection={c}
                    displaySignatures={featureFlags.display_signatures}
                    showNamespace={true}
                  />
                ))}
              </DataList>
              <Link
                to={formatPath(Paths.collections)}
              >{t`Show all collections`}</Link>
            </>
          )}
        </PageSection>
        {featureFlags.legacy_roles ? (
          <>
            <SectionSeparator />
            <PageSection>
              <SectionTitle>{t`Legacy roles`}</SectionTitle>

              {roles === null ? (
                <LoadingPageSpinner />
              ) : roles.length === 0 ? (
                <EmptyStateNoData
                  title={t`No matching legacy roles found.`}
                  description={
                    <Link
                      to={formatPath(Paths.legacyRoles)}
                    >{t`Show all legacy roles`}</Link>
                  }
                />
              ) : (
                <>
                  <DataList aria-label={t`Available matching legacy roles`}>
                    {roles.map((r) => (
                      <LegacyRoleListItem
                        key={r.id}
                        role={r}
                        show_thumbnail={true}
                      />
                    ))}
                  </DataList>
                  <Link
                    to={formatPath(Paths.legacyRoles)}
                  >{t`Show all legacy roles`}</Link>
                </>
              )}
            </PageSection>
          </>
        ) : null}
      </Main>
    </>
  );
};

export default withRouter(Dispatch);
