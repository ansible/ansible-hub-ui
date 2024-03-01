import { t } from '@lingui/macro';
import { Toolbar, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { useEffect, useState } from 'react';
import { AnsibleDistributionAPI } from 'src/api';
import {
  AppliedFilters,
  ClipboardCopy,
  CollectionHeader,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  HubPagination,
  LoadingPageSpinner,
  LoadingPageWithHeader,
  Main,
  SortTable,
} from 'src/components';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import {
  ParamHelper,
  RouteProps,
  filterIsSet,
  getRepoURL,
  withRouter,
} from 'src/utilities';
import { loadCollection } from './base';

const CollectionDistributions = (props: RouteProps) => {
  const routeParams = ParamHelper.parseParamString(props.location.search);

  const [actuallyCollection, setActuallyCollection] = useState(null);
  const [collection, setCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [content, setContent] = useState(null);
  const [count, setCount] = useState(0);
  const [distributions, setDistributions] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState(
    Object.keys(routeParams).length
      ? routeParams
      : {
          sort: '-pulp_created',
        },
  );

  const loadCollections = (forceReload) => {
    loadCollection({
      forceReload,
      matchParams: props.routeParams,
      navigate: props.navigate,
      setCollection: (
        collections,
        collection,
        content,
        collectionsCount,
        actuallyCollection,
      ) => {
        setActuallyCollection(actuallyCollection);
        setCollection(collection);
        setCollections(collections);
        setCollectionsCount(collectionsCount);
        setContent(content);

        loadDistributions(collection.repository.pulp_href);
      },
      stateParams: params,
    });
  };

  const loadDistributions = async (repositoryHref: string) => {
    setLoading(true);
    const distroList = await AnsibleDistributionAPI.list({
      repository: repositoryHref,
      ...ParamHelper.getReduced(params, ['version']),
    });

    setDistributions(distroList.data.results);
    setCount(distroList.data.count);
    setLoading(false);
  };

  useEffect(() => {
    loadCollections(false);
  }, []);

  useEffect(() => {
    loadCollections(false);
  }, [params]);

  if (!collection || !content || collections.length <= 0) {
    return <LoadingPageWithHeader />;
  }

  const { collection_version, repository } = collection;

  const breadcrumbs = [
    namespaceBreadcrumb(),
    {
      url: formatPath(Paths.namespaceDetail, {
        namespace: collection_version.namespace,
      }),
      name: collection_version.namespace,
    },
    {
      url: formatPath(Paths.collectionByRepo, {
        namespace: collection_version.namespace,
        collection: collection_version.name,
        repo: repository.name,
      }),
      name: collection_version.name,
    },
    { name: t`Distributions` },
  ];

  const cliConfig = (distribution) =>
    [
      '[galaxy]',
      `server_list = ${distribution.base_path}`,
      '',
      `[galaxy_server.${distribution.base_path}]`,
      `url=${getRepoURL(distribution.base_path)}`,
      'token=<put your token here>',
    ].join('\n');

  const updateParamsMixin = (params) => {
    props.navigate({
      search: '?' + ParamHelper.getQueryString(params || []),
    });

    setParams(params);
  };

  const renderTable = (distributions, params) => {
    if (distributions.length === 0) {
      return filterIsSet(params, [
        'name__icontains',
        'base_path__icontains',
      ]) ? (
        <EmptyStateFilter />
      ) : (
        <EmptyStateNoData
          title={t`No distributions yet`}
          description={t`Collection doesn't have any distribution assigned.`}
        />
      );
    }

    const sortTableOptions = {
      headers: [
        {
          title: t`Name`,
          type: 'alpha',
          id: 'name',
        },
        {
          title: t`Base path`,
          type: 'alpha',
          id: 'base_path',
        },
        {
          title: t`Created`,
          type: 'alpha',
          id: 'pulp_created',
        },
        {
          title: t`CLI configuration`,
          type: 'none',
          id: '',
        },
      ],
    };

    return (
      <Table aria-label={t`Collection distributions`}>
        <SortTable
          options={sortTableOptions}
          params={params}
          updateParams={(params) => {
            updateParamsMixin(params);
          }}
        />
        <Tbody>
          {distributions.map((distribution, i) => (
            <Tr key={i}>
              <Td>{distribution.name}</Td>
              <Td>{distribution.base_path}</Td>
              <Td>
                <DateComponent date={distribution.pulp_created} />
              </Td>
              <Td>
                <ClipboardCopy isCode isReadOnly variant={'expansion'} key={i}>
                  {cliConfig(distribution)}
                </ClipboardCopy>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  return (
    <>
      <CollectionHeader
        activeTab='distributions'
        actuallyCollection={actuallyCollection}
        breadcrumbs={breadcrumbs}
        collection={collection}
        collections={collections}
        collectionsCount={collectionsCount}
        content={content}
        params={params}
        reload={() => loadCollections(true)}
        updateParams={(params) => {
          updateParamsMixin(
            ParamHelper.setParam(params, 'version', params.version),
          );
        }}
      />
      <Main>
        <section className='body'>
          <div className='hub-toolbar'>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    inputText={inputText}
                    onChange={(text) => {
                      setInputText(text);
                    }}
                    updateParams={(p) => {
                      updateParamsMixin(p);
                    }}
                    params={params}
                    filterConfig={[
                      {
                        id: 'name__icontains',
                        title: t`Name`,
                      },
                      {
                        id: 'base_path__icontains',
                        title: t`Base path`,
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </Toolbar>

            <HubPagination
              params={params}
              updateParams={(p) => {
                updateParamsMixin(p);
              }}
              count={count}
              isTop
            />
          </div>

          <AppliedFilters
            updateParams={(p) => {
              updateParamsMixin(p);
              setInputText('');
            }}
            params={params}
            ignoredParams={['page_size', 'page', 'sort', 'version']}
            niceNames={{
              base_path__icontains: t`Base path`,
              name__icontains: t`Name`,
            }}
          />
          {loading ? (
            <LoadingPageSpinner />
          ) : (
            renderTable(distributions, params)
          )}
          <HubPagination
            params={params}
            updateParams={(p) => {
              updateParamsMixin(p);
            }}
            count={count}
          />
        </section>
      </Main>
    </>
  );
};

export default withRouter(CollectionDistributions);
