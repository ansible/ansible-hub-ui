import { t } from '@lingui/macro';
import {
  DataList,
  Label,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
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
  AppliedFilters,
  BaseHeader,
  CollectionListItem,
  CompoundFilter,
  DateComponent,
  EmptyStateNoData,
  LegacyNamespaceListItem,
  LegacyRoleListItem,
  LoadingPageSpinner,
  Main,
  NamespaceCard,
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

export const MultiSearch = (props: RouteProps) => {
  const { featureFlags } = useContext();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [inputText, setInputText] = useState<string>('');
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
    }

    CollectionVersionAPI.list({ keywords, is_highest: true })
      .then(({ data: { data } }) => setCollections(data || []))
      .catch(
        handleHttpError(
          t`Failed to search collections (${keywords})`,
          () => setCollections([]),
          addAlert,
        ),
      );
    NamespaceAPI.list({ keywords })
      .then(({ data: { data } }) => setNamespaces(data || []))
      .catch(
        handleHttpError(
          t`Failed to search namespaces (${keywords})`,
          () => setNamespaces([]),
          addAlert,
        ),
      );

    if (featureFlags.legacy_roles) {
      LegacyRoleAPI.list({ keywords })
        .then(({ data: { results } }) => setRoles(results || []))
        .catch(
          handleHttpError(
            t`Failed to search roles (${keywords})`,
            () => setRoles([]),
            addAlert,
          ),
        );
      LegacyNamespaceAPI.list({ keywords })
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
      ExecutionEnvironmentAPI.list({ keywords })
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

  return (
    <>
      <BaseHeader title={t`Search`} />
      <AlertList
        alerts={alerts}
        closeAlert={(i) => closeAlert(i, { alerts, setAlerts })}
      />
      <Main>
        <PageSection>
          <div className='hub-toolbar'>
            <Toolbar>
              <ToolbarContent>
                <ToolbarGroup>
                  <ToolbarItem>
                    <CompoundFilter
                      inputText={inputText}
                      onChange={setInputText}
                      updateParams={(p) => updateParams(p)}
                      params={params}
                      filterConfig={[
                        {
                          id: 'keywords',
                          title: t`Keywords`,
                        },
                      ]}
                    />
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
          </div>
          <div>
            <AppliedFilters
              updateParams={(p) => {
                updateParams(p);
                setInputText('');
              }}
              params={params}
              ignoredParams={['page_size', 'page', 'sort', 'ordering']}
              niceNames={{
                keywords: t`Keywords`,
              }}
            />
          </div>
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
        <SectionSeparator />
        <PageSection>
          <SectionTitle>{t`Namespaces`}</SectionTitle>

          {namespaces === null ? (
            <LoadingPageSpinner />
          ) : namespaces.length === 0 ? (
            <EmptyStateNoData
              title={t`No matching namespaces found.`}
              description={
                <Link
                  to={formatPath(Paths.namespaces)}
                >{t`Show all namespaces`}</Link>
              }
            />
          ) : (
            <>
              <section className='card-layout'>
                {namespaces.map((ns, i) => (
                  <div key={i} className='card-wrapper'>
                    <NamespaceCard
                      namespaceURL={formatPath(Paths.namespaces, {
                        namespace: ns.name,
                      })}
                      key={i}
                      {...ns}
                    />
                  </div>
                ))}
              </section>
              <Link
                to={formatPath(Paths.namespaces)}
              >{t`Show all namespaces`}</Link>
            </>
          )}
        </PageSection>
        {featureFlags.legacy_roles ? (
          <>
            <SectionSeparator />
            <PageSection>
              <SectionTitle>{t`Roles`}</SectionTitle>

              {roles === null ? (
                <LoadingPageSpinner />
              ) : roles.length === 0 ? (
                <EmptyStateNoData
                  title={t`No matching roles found.`}
                  description={
                    <Link
                      to={formatPath(Paths.legacyRoles)}
                    >{t`Show all roles`}</Link>
                  }
                />
              ) : (
                <>
                  <DataList aria-label={t`Available matching roles`}>
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
                  >{t`Show all roles`}</Link>
                </>
              )}
            </PageSection>
            <SectionSeparator />
            <PageSection>
              <SectionTitle>{t`Role Namespaces`}</SectionTitle>

              {roleNamespaces === null ? (
                <LoadingPageSpinner />
              ) : roleNamespaces.length === 0 ? (
                <EmptyStateNoData
                  title={t`No matching role namespaces found.`}
                  description={
                    <Link
                      to={formatPath(Paths.legacyNamespaces)}
                    >{t`Show all role namespaces`}</Link>
                  }
                />
              ) : (
                <>
                  <DataList aria-label={t`Available matching role namespaces`}>
                    {roleNamespaces.map((r) => (
                      <LegacyNamespaceListItem key={r.id} namespace={r} />
                    ))}
                  </DataList>
                  <Link
                    to={formatPath(Paths.legacyNamespaces)}
                  >{t`Show all role namespaces`}</Link>
                </>
              )}
            </PageSection>
          </>
        ) : null}
        {featureFlags.execution_environments ? (
          <>
            <SectionSeparator />
            <PageSection>
              <SectionTitle>{t`Execution Environments`}</SectionTitle>

              {containers === null ? (
                <LoadingPageSpinner />
              ) : containers.length === 0 ? (
                <EmptyStateNoData
                  title={t`No matching execution environments found.`}
                  description={
                    <Link
                      to={formatPath(Paths.executionEnvironments)}
                    >{t`Show all execution environments`}</Link>
                  }
                />
              ) : (
                <>
                  <DataList
                    aria-label={t`Available matching execution environments`}
                  >
                    {containers.map((item, index) => (
                      <tr
                        data-cy={`ExecutionEnvironmentList-row-${item.name}`}
                        key={index}
                      >
                        <td>
                          <Link
                            to={formatEEPath(Paths.executionEnvironmentDetail, {
                              container: item.pulp.distribution.base_path,
                            })}
                          >
                            {item.name}
                          </Link>
                        </td>
                        {item.description ? (
                          <td className={'pf-m-truncate'}>
                            <Tooltip content={item.description}>
                              {item.description}
                            </Tooltip>
                          </td>
                        ) : (
                          <td />
                        )}
                        <td>
                          <DateComponent date={item.created_at} />
                        </td>
                        <td>
                          <DateComponent date={item.updated_at} />
                        </td>
                        <td>
                          <Label>
                            {item.pulp.repository.remote ? t`Remote` : t`Local`}
                          </Label>
                        </td>
                      </tr>
                    ))}
                  </DataList>
                  <Link
                    to={formatPath(Paths.executionEnvironments)}
                  >{t`Show all execution environments`}</Link>
                </>
              )}
            </PageSection>
          </>
        ) : null}
      </Main>
    </>
  );
};

export default withRouter(MultiSearch);
