import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Bullseye, DataList } from '@patternfly/react-core';
import React, { type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CollectionVersionAPI, LegacyRoleAPI } from 'src/api';
import {
  BaseHeader,
  CollectionListItem,
  EmptyStateNoData,
  LoadingSpinner,
  Main,
  RoleItem,
} from 'src/components';
import { useHubContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, type RouteProps, withRouter } from 'src/utilities';
import NotFoundImage from 'static/images/not_found.svg';

const PageSection = ({ children, ...rest }: { children: ReactNode }) => (
  <section className='body' {...rest}>
    {children}
  </section>
);

const SectionSeparator = () => <section>&nbsp;</section>;

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className='pf-v5-c-title'>{children}</h2>
);

const Dispatch = ({ location, navigate }: RouteProps) => {
  const { featureFlags } = useHubContext();

  const { pathname } = ParamHelper.parseParamString(location.search) as {
    pathname: string;
  };

  const [namespace, name] = pathname.split('/').filter(Boolean);

  const [collections, setCollections] = useState(null);
  const [roles, setRoles] = useState(null);

  useEffect(() => {
    const wait = [];

    wait.push(
      CollectionVersionAPI.list({ namespace, name, is_highest: true })
        .then(({ data: { data } }) => data || [])
        .catch(() => [])
        .then((c) => (setCollections(c), c)),
    );

    if (featureFlags.legacy_roles) {
      wait.push(
        LegacyRoleAPI.list({ name, namespace })
          .then(({ data: { results } }) => results || [])
          .catch(() => [])
          .then((r) => (setRoles(r), r)),
      );
    }

    Promise.all(wait).then(([collections, roles]) => {
      if (collections.length === 1 && !roles?.length) {
        const {
          collection_version: { name: collection, namespace },
          repository: { name: repo },
        } = collections[0];

        navigate(
          formatPath(Paths.collectionByRepo, {
            collection,
            namespace,
            repo,
          }),
        );
      }

      if (roles.length === 1 && !collections.length) {
        const {
          name,
          summary_fields: {
            namespace: { name: namespace },
          },
        } = roles[0];

        navigate(
          formatPath(Paths.standaloneRole, {
            namespace,
            name,
          }),
        );
      }
    });
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
              <div className='pf-v5-c-content'>
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
            <LoadingSpinner />
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
                    showNamespace
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
              <SectionTitle>{t`Roles`}</SectionTitle>

              {roles === null ? (
                <LoadingSpinner />
              ) : roles.length === 0 ? (
                <EmptyStateNoData
                  title={t`No matching roles found.`}
                  description={
                    <Link
                      to={formatPath(Paths.standaloneRoles)}
                    >{t`Show all roles`}</Link>
                  }
                />
              ) : (
                <>
                  <DataList aria-label={t`Available matching roles`}>
                    {roles.map((r) => (
                      <RoleItem key={r.id} role={r} show_thumbnail />
                    ))}
                  </DataList>
                  <Link
                    to={formatPath(Paths.standaloneRoles)}
                  >{t`Show all roles`}</Link>
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
