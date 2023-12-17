import { t } from '@lingui/macro';
import { DataList, Label } from '@patternfly/react-core';
import React, { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CollectionVersionAPI,
  ExecutionEnvironmentAPI,
  LegacyNamespaceAPI,
  LegacyRoleAPI,
  NamespaceAPI,
} from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  CollectionListItem,
  EmptyStateXs,
  LegacyNamespaceListItem,
  LegacyRoleListItem,
  LoadingPageSpinner,
  Main,
  MultiSearchSearch,
  NamespaceListItem,
  Tooltip,
  closeAlert,
} from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { Paths, formatEEPath, formatPath } from 'src/paths';
import {
  ParamHelper,
  RouteProps,
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
  <h2 className='pf-c-title'>{children}</h2>
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
  const { featureFlags } = useContext();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [params, setParams] = useState({});

  const [collections, setCollections] = useState([]);
  const [roles, setRoles] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [roleNamespaces, setRoleNamespaces] = useState([]);
  const [containers, setContainers] = useState([]);

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
      setContainers([]);
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

    if (featureFlags.execution_environments) {
      setContainers(loading);
      ExecutionEnvironmentAPI.list({ ...shared, name__icontains: keywords })
        .then(({ data: { data } }) => setContainers(data || []))
        .catch(
          handleHttpError(
            t`Failed to search execution environments (${keywords})`,
            () => setContainers([]),
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
          <LoadingPageSpinner />
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
                showNamespace={true}
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
                <LegacyRoleListItem key={r.id} role={r} show_thumbnail={true} />
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
                <LegacyNamespaceListItem key={r.id} namespace={r} />
              ))}
            </DataList>
          </ResultsSection>
        ) : null}

        {featureFlags.execution_environments ? (
          <ResultsSection
            items={containers}
            title={t`Execution environments`}
            showAllLink={
              <Link
                to={formatPath(Paths.executionEnvironments)}
              >{t`Show all execution environments`}</Link>
            }
            showMoreLink={
              <Link
                to={formatPath(
                  Paths.executionEnvironments,
                  {},
                  { name__icontains: keywords },
                )}
              >{t`Show more execution environments`}</Link>
            }
          >
            <DataList
              aria-label={t`Available matching execution environments`}
              className='hub-card-layout'
              style={{ paddingTop: '8px' }}
            >
              {containers.map((item, index) => (
                <section
                  key={index}
                  className='card-wrapper'
                  style={{ width: '300px' }}
                >
                  <article className='pf-c-card'>
                    <div className='pf-c-card__title'>
                      <Link
                        to={formatEEPath(Paths.executionEnvironmentDetail, {
                          container: item.pulp.distribution.base_path,
                        })}
                      >
                        {item.name}
                      </Link>
                    </div>
                    <div className='pf-c-card__body pf-m-truncate'>
                      {item.description ? (
                        <Tooltip content={item.description}>
                          {item.description}
                        </Tooltip>
                      ) : null}
                    </div>
                    <div className='pf-c-card__footer'>
                      <Label>
                        {item.pulp.repository.remote ? t`Remote` : t`Local`}
                      </Label>
                    </div>
                  </article>
                </section>
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

        {featureFlags.execution_environments ? (
          <NotFoundSection
            items={containers}
            title={t`Execution environments`}
            emptyStateTitle={t`No matching execution environments found.`}
            showAllLink={
              <Link
                to={formatPath(Paths.executionEnvironments)}
              >{t`Show all execution environments`}</Link>
            }
          />
        ) : null}
      </Main>
    </>
  );
};

export default withRouter(MultiSearch);
