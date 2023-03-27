import { t } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { AnsibleDistributionAPI } from 'src/api';
import {
  ClipboardCopy,
  CollectionHeader,
  DateComponent,
  LoadingPageWithHeader,
  Main,
  Pagination,
  SortTable,
} from 'src/components';
import { Paths, formatPath, namespaceBreadcrumb } from 'src/paths';
import { RouteProps, withRouter } from 'src/utilities';
import { getRepoUrl } from 'src/utilities';
import { ParamHelper } from 'src/utilities/param-helper';
import { loadCollection } from './base';

const CollectionDistributions = (props: RouteProps) => {
  const routeParams = ParamHelper.parseParamString(props.location.search);

  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(null);
  const [content, setContent] = useState(null);

  const [params, setParams] = useState(
    Object.keys(routeParams).length
      ? routeParams
      : {
          sort: '-pulp_created',
        },
  );
  const [distributions, setDistributions] = useState(null);
  const [count, setCount] = useState(0);

  const loadCollections = (forceReload) => {
    loadCollection({
      forceReload,
      matchParams: props.routeParams,
      navigate: props.navigate,
      setCollection: (collections, collection, content) => {
        setCollections(collections);
        setCollection(collection);
        setContent(content);

        loadDistributions(collection.repository.pulp_href);
      },
      stateParams: params,
    });
  };

  const loadDistributions = async (repositoryHref: string) => {
    const distroList = await AnsibleDistributionAPI.list({
      repository: repositoryHref,
      ...ParamHelper.getReduced(params, ['version']),
    });

    setDistributions(distroList.data.results);
    setCount(distroList.data.count);
  };

  useEffect(() => {
    loadCollections(false);
  }, []);

  useEffect(() => {
    loadCollections(false);
  }, [params]);

  if (!collection || !content || collections.length <= 0 || !distributions) {
    return <LoadingPageWithHeader></LoadingPageWithHeader>;
  }

  const { collection_version, repository } = collection;

  const breadcrumbs = [
    namespaceBreadcrumb,
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
      `url=${getRepoUrl()}`,
      'token=<put your token here>',
    ].join('\n');

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

  const updateParamsMixin = (params) => {
    props.navigate({
      search: '?' + ParamHelper.getQueryString(params || []),
    });
  };

  return (
    <React.Fragment>
      <CollectionHeader
        reload={() => loadCollections(true)}
        collections={collections}
        collection={collection}
        content={content}
        params={params}
        updateParams={(params) => {
          updateParamsMixin(
            ParamHelper.setParam(params, 'version', params.version),
          );
          setParams(params);
        }}
        breadcrumbs={breadcrumbs}
        activeTab='distributions'
      />
      <Main>
        <section className='body'>
          <table
            aria-label={t`Collection distributions`}
            className='hub-c-table-content pf-c-table'
          >
            <SortTable
              options={sortTableOptions}
              params={params}
              updateParams={(params) => {
                updateParamsMixin(params);
                setParams(params);
              }}
            />
            <tbody>
              {distributions.map((distribution, i) => (
                <tr key={i}>
                  <td>{distribution.name}</td>
                  <td>{distribution.base_path}</td>
                  <td>
                    <DateComponent date={distribution.pulp_created} />
                  </td>
                  <td>
                    <ClipboardCopy
                      isCode
                      isReadOnly
                      variant={'expansion'}
                      key={i}
                    >
                      {cliConfig(distribution)}
                    </ClipboardCopy>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            params={params}
            updateParams={(p) => {
              updateParamsMixin(p);
              setParams(p);
            }}
            count={count}
          />
        </section>
      </Main>
    </React.Fragment>
  );
};

export default withRouter(CollectionDistributions);
