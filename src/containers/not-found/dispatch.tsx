import { Trans, t } from '@lingui/macro';
import { DataList } from '@patternfly/react-core';
import React, { ReactNode, useEffect, useState } from 'react';
import { CollectionVersionAPI, LegacyRoleAPI } from 'src/api';
import {
  BaseHeader,
  CollectionListItem,
  LegacyRoleListItem,
  LoadingPageSpinner,
  Main,
} from 'src/components';
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
    LegacyRoleAPI.list({ username: namespace, name })
      .then(({ data: { results } }) => setRoles(results || []))
      .catch(() => setRoles([]));
  }, [pathname]);

  // TODO condition for roles feature flag, signatures feature flag
  // TODO empty states proper
  // TODO center empty state top

  return (
    <>
      <BaseHeader title={t`404 - Page not found`} />
      <Main>
        <PageSection>
          <div>{t`We couldn't find the page you're looking for!`}</div>
          <div>
            <Trans>
              Pathname <pre style={{ display: 'inline-block' }}>{pathname}</pre>{' '}
              could refer to a collection or a role.
            </Trans>
          </div>
        </PageSection>
        <SectionSeparator />
        <PageSection>
          <SectionTitle>{t`Collections`}</SectionTitle>

          {collections === null ? (
            <LoadingPageSpinner />
          ) : collections.length === 0 ? (
            <div>{t`No matching collections found.`}</div>
          ) : (
            <DataList aria-label={t`Available matching collections`}>
              {collections.map((c, i) => (
                <CollectionListItem
                  key={i}
                  collection={c}
                  displaySignatures={true}
                  showNamespace={true}
                />
              ))}
            </DataList>
          )}
        </PageSection>
        <SectionSeparator />
        <PageSection>
          <SectionTitle>{t`Legacy roles`}</SectionTitle>

          {roles === null ? (
            <LoadingPageSpinner />
          ) : roles.length === 0 ? (
            <div>{t`No matching legacy roles found.`}</div>
          ) : (
            <DataList aria-label={t`Available matching legacy roles`}>
              {roles.map((r) => (
                <LegacyRoleListItem key={r.id} role={r} show_thumbnail={true} />
              ))}
            </DataList>
          )}
        </PageSection>
      </Main>
    </>
  );
};

export default withRouter(Dispatch);
