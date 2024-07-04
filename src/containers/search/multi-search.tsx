import { t } from '@lingui/macro';
import { DataList } from '@patternfly/react-core';
import React, { type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CollectionVersionAPI,
  LegacyNamespaceAPI,
  LegacyRoleAPI,
  NamespaceAPI,
} from 'src/api';
import {
  AlertList,
  type AlertType,
  BaseHeader,
  CollectionListItem,
  EmptyStateXs,
  LoadingSpinner,
  Main,
  MultiSearchSearch,
  NamespaceListItem,
  RoleItem,
  RoleNamespaceItem,
  closeAlert,
} from 'src/components';
import { useHubContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import {
  ParamHelper,
  type RouteProps,
  handleHttpError,
  withRouter,
} from 'src/utilities';

const PageSection = ({ children, ...rest }: { children: ReactNode }) => (
  <section className='body' {...rest}>
    {children}
  </section>
);

const SectionSeparator = () => <section>&nbsp;</section>;

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className='pf-v5-c-title'>{children}</h2>
);

const Section = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => (
  <>
    <SectionSeparator />
    <PageSection>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </PageSection>
  </>
);

const loading = [];

const MultiSearch = (props: RouteProps) => {
  const { featureFlags } = useHubContext();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [params, setParams] = useState({});

  const [collections, setCollections] = useState([]);
  const [roles, setRoles] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [roleNamespaces, setRoleNamespaces] = useState([]);

  const keywords = (params as { keywords: string })?.keywords || '';

  function addAlert(alert: AlertType) {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }

  function query() {
    if (!keywords) {
      setCollections([]);
      setNamespaces([]);
      setRoles([]);
      setRoleNamespaces([]);
      return;
    }

    const shared = { page_size: 10 };

    setCollections(loading);
    CollectionVersionAPI.list({ ...shared, keywords, is_highest: true })
      .then(({ data: { data } }) => setCollections(data || []))
      .catch(
        handleHttpError(
          t`Failed to search collections (${keywords})`,
          () => setCollections([]),
          addAlert,
        ),
      );

    setNamespaces(loading);
    NamespaceAPI.list({ ...shared, keywords })
      .then(({ data: { data } }) => setNamespaces(data || []))
      .catch(
        handleHttpError(
          t`Failed to search namespaces (${keywords})`,
          () => setNamespaces([]),
          addAlert,
        ),
      );

    if (featureFlags.legacy_roles) {
      setRoles(loading);
      LegacyRoleAPI.list({ ...shared, keywords })
        .then(({ data: { results } }) => setRoles(results || []))
        .catch(
          handleHttpError(
            t`Failed to search roles (${keywords})`,
            () => setRoles([]),
            addAlert,
          ),
        );

      setRoleNamespaces(loading);
      LegacyNamespaceAPI.list({ ...shared, keywords })
        .then(({ data: { results } }) => setRoleNamespaces(results || []))
        .catch(
          handleHttpError(
            t`Failed to search role namespaces (${keywords})`,
            () => setRoleNamespaces([]),
            addAlert,
          ),
        );
    }
  }

  function updateParams(params) {
    delete params.page;

    props.navigate({
      search: '?' + ParamHelper.getQueryString(params || []),
    });

    setParams(params);
  }

  useEffect(() => {
    setParams(ParamHelper.parseParamString(props.location.search));
  }, [props.location.search]);

  useEffect(() => {
    query();
  }, [keywords]);

  const ResultsSection = ({
    children,
    items,
    showAllLink,
    showMoreLink,
    title,
  }: {
    children: ReactNode;
    items;
    showAllLink: ReactNode;
    showMoreLink: ReactNode;
    title: string;
  }) =>
    items === loading || !keywords || items.length ? (
      <Section title={title}>
        {items === loading ? (
          <LoadingSpinner />
        ) : !keywords ? (
          showAllLink
        ) : (
          <>
            {children}
            {showMoreLink}
            <br />
            {showAllLink}
          </>
        )}
      </Section>
    ) : null;

  const NotFoundSection = ({
    emptyStateTitle,
    items,
    showAllLink,
    title,
  }: {
    emptyStateTitle: string;
    items;
    showAllLink: ReactNode;
    title: string;
  }) =>
    keywords && items !== loading && !items.length ? (
      <Section title={title}>
        <EmptyStateXs title={emptyStateTitle} description={showAllLink} />
      </Section>
    ) : null;

  return (
    <>
      <BaseHeader title={t`Search`} />
      <AlertList
        alerts={alerts}
        closeAlert={(i) => closeAlert(i, { alerts, setAlerts })}
      />
      <Main>
        <MultiSearchSearch
          params={params}
          updateParams={(p) => updateParams(p)}
        />

        {/* loading and non-empty lists go before not found */}
        <ResultsSection
          items={collections}
          title={t`Collections`}
          showAllLink={
            <Link
              to={formatPath(Paths.collections)}
            >{t`Show all collections`}</Link>
          }
          showMoreLink={
            <Link
              to={formatPath(Paths.collections, {}, { keywords })}
            >{t`Show more collections`}</Link>
          }
        >
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
        </ResultsSection>

        <ResultsSection
          items={namespaces}
          title={t`Namespaces`}
          showAllLink={
            <Link
              to={formatPath(Paths.namespaces)}
            >{t`Show all namespaces`}</Link>
          }
          showMoreLink={
            <Link
              to={formatPath(Paths.namespaces, {}, { keywords })}
            >{t`Show more namespaces`}</Link>
          }
        >
          <DataList aria-label={t`Available matching namespaces`}>
            {namespaces.map((ns, i) => (
              <NamespaceListItem key={i} namespace={ns} />
            ))}
          </DataList>
        </ResultsSection>

        {featureFlags.legacy_roles ? (
          <ResultsSection
            items={roles}
            title={t`Roles`}
            showAllLink={
              <Link
                to={formatPath(Paths.standaloneRoles)}
              >{t`Show all roles`}</Link>
            }
            showMoreLink={
              <Link
                to={formatPath(Paths.standaloneRoles, {}, { keywords })}
              >{t`Show more roles`}</Link>
            }
          >
            <DataList aria-label={t`Available matching roles`}>
              {roles.map((r) => (
                <RoleItem key={r.id} role={r} show_thumbnail />
              ))}
            </DataList>
          </ResultsSection>
        ) : null}

        {featureFlags.legacy_roles ? (
          <ResultsSection
            items={roleNamespaces}
            title={t`Role namespaces`}
            showAllLink={
              <Link
                to={formatPath(Paths.standaloneNamespaces)}
              >{t`Show all role namespaces`}</Link>
            }
            showMoreLink={
              <Link
                to={formatPath(Paths.standaloneNamespaces, {}, { keywords })}
              >{t`Show more role namespaces`}</Link>
            }
          >
            <DataList aria-label={t`Available matching role namespaces`}>
              {roleNamespaces.map((r) => (
                <RoleNamespaceItem key={r.id} namespace={r} />
              ))}
            </DataList>
          </ResultsSection>
        ) : null}

        <SectionSeparator />
        <hr />

        <NotFoundSection
          items={collections}
          title={t`Collections`}
          emptyStateTitle={t`No matching collections found.`}
          showAllLink={
            <Link
              to={formatPath(Paths.collections)}
            >{t`Show all collections`}</Link>
          }
        />

        <NotFoundSection
          items={namespaces}
          title={t`Namespaces`}
          emptyStateTitle={t`No matching namespaces found.`}
          showAllLink={
            <Link
              to={formatPath(Paths.namespaces)}
            >{t`Show all namespaces`}</Link>
          }
        />

        {featureFlags.legacy_roles ? (
          <NotFoundSection
            items={roles}
            title={t`Roles`}
            emptyStateTitle={t`No matching roles found.`}
            showAllLink={
              <Link
                to={formatPath(Paths.standaloneRoles)}
              >{t`Show all roles`}</Link>
            }
          />
        ) : null}

        {featureFlags.legacy_roles ? (
          <NotFoundSection
            items={roleNamespaces}
            title={t`Role namespaces`}
            emptyStateTitle={t`No matching role namespaces found.`}
            showAllLink={
              <Link
                to={formatPath(Paths.standaloneNamespaces)}
              >{t`Show all role namespaces`}</Link>
            }
          />
        ) : null}
      </Main>
    </>
  );
};

export default withRouter(MultiSearch);
