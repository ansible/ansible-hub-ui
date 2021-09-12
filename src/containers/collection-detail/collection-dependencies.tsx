import { t } from '@lingui/macro';
import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';

import {
  List,
  ListItem,
  ListVariant,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Text,
} from '@patternfly/react-core';

import {
  CollectionDetailType,
  ImportAPI,
  ImportDetailType,
  ImportListType,
} from 'src/api';
import {
  CollectionHeader,
  LoadingPageWithHeader,
  ImportConsole,
  Main,
  Pagination,
  Sort,
} from 'src/components';

import { IBaseCollectionState } from './base';
import { ParamHelper } from 'src/utilities/param-helper';
import { formatPath, namespaceBreadcrumb, Paths } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';

import { CollectionAPI } from 'src/api/';

import './collection-dependencies.scss';
interface IState {
  collection: IBaseCollectionState['collection'];
  //dependencies: any[];
  headerParams: IBaseCollectionState['params'];
  params: {
    page?: number;
    page_size?: number;
    keywords?: string;
    sort?: string;
  };
  usedByDependencies: any[];
}

class CollectionDependencies extends React.Component<
  RouteComponentProps,
  IState
> {
  private ignoredParams = ['page_size', 'page', 'sort', 'keywords'];
  constructor(props) {
    super(props);

    const headerParams =
      {}; /* ParamHelper.parseParamString(props.location.search, [
      'version',
      'showing',
      'keywords',
    ]);
    */

    const params = ParamHelper.parseParamString(props.location.search); /*, [
      'keywords',
      'page',
      'page_size',
    ]*/

    if (!params['page']) {
      params['page'] = 1;
    }

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['sort']) {
      params['sort'] = 'name';
    }

    this.state = {
      collection: undefined,
      headerParams: headerParams,
      params,
      usedByDependencies: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    const { collection, params, headerParams, usedByDependencies } = this.state;

    if (!collection) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    let { dependencies } = collection.latest_version.metadata;

    dependencies = {
      ...dependencies,
      'mytestcollsdtpvoomv.mytestcollsevpzzbuhof': '>=2.5.9',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi1': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi2': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi3': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi4': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi5': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi6': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi11': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi21': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi31': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi41': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi51': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi61': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi12': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi22': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi32': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi42': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi52': '<=3.6.2',
      'mytestcollsdtpvoomv.mytestcollsojfmqxigvi62': '<=3.6.2',
    };

    const usedByDependenciesCount = usedByDependencies.length;

    const breadcrumbs = [
      namespaceBreadcrumb,
      {
        url: formatPath(Paths.namespaceByRepo, {
          namespace: collection.namespace.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.namespace.name,
      },
      {
        url: formatPath(Paths.collectionByRepo, {
          namespace: collection.namespace.name,
          collection: collection.name,
          repo: this.context.selectedRepo,
        }),
        name: collection.name,
      },
      { name: t`Dependencies` },
    ];

    let toShow: any[] = [];
    //const summary = {};
    const keywords = params.keywords || '';

    for (let c of usedByDependencies) {
      if (c.name.match(keywords)) {
        toShow.push(c);
      }
    }
    // console.log(keywords, toShow)

    return (
      <React.Fragment>
        <CollectionHeader
          collection={collection}
          params={headerParams}
          updateParams={(params) =>
            this.updateParams(params, () => this.loadData())
          }
          breadcrumbs={breadcrumbs}
          activeTab='dependencies'
          repo={this.context.selectedRepo}
        />
        <Main>
          <section className='body'>
            <div className='pf-c-content collection-dependencies'>
              <Text>{t`Dependencies`}</Text>
              <p>{t`This collection is dependent on the following collections`}</p>
              <List variant={ListVariant.inline}>
                {Object.keys(dependencies).map((dependency) => (
                  <ListItem key={dependency}>
                    <Link
                      to={formatPath(
                        Paths.collectionByRepo,
                        {
                          collection:
                            this.separateCollectionByDependency(dependency)[1],
                          namespace:
                            this.separateCollectionByDependency(dependency)[0],
                          repo: this.context.selectedRepo,
                        },
                        ParamHelper.getReduced(params, this.ignoredParams),
                      )}
                    >
                      {this.separateCollectionByDependency(dependency)[1]}
                    </Link>
                  </ListItem>
                ))}
              </List>
              <p>{t`This collection is being used by `}</p>
              <div className='usedby-dependencies-header'>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarItem>
                      <SearchInput
                        style={{ width: '211px' }}
                        value={params.keywords || ''}
                        onChange={(val) =>
                          this.updateParams(
                            ParamHelper.setParam(params, 'keywords', val),
                          )
                        }
                        onClear={() =>
                          this.updateParams(
                            ParamHelper.setParam(params, 'keywords', ''),
                            () => this.loadData(),
                          )
                        }
                        aria-label='filter-content'
                        placeholder={t`Filter collection name`}
                      />
                    </ToolbarItem>
                    <ToolbarItem>
                      <Sort
                        options={[
                          { title: t`Name`, id: 'name', type: 'alpha' },
                        ]}
                        params={params}
                        updateParams={(p) =>
                          this.updateParams(p /*() => this.loadData()*/)
                        }
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
                <Pagination
                  params={params}
                  updateParams={(params) =>
                    this.updateParams(params, () => this.setState({ params }))
                  }
                  count={usedByDependenciesCount}
                  isTop
                />
              </div>

              <table className='content-table pf-c-table pf-m-compact'>
                <tbody>
                  {this.filterUsedByDependencies(usedByDependencies).map(
                    ({ name, namespace }) => (
                      <tr key={name}>
                        <td>
                          <Link
                            to={formatPath(
                              Paths.collectionByRepo,
                              {
                                collection: name,
                                namespace: namespace,
                                repo: this.context.selectedRepo,
                              },
                              ParamHelper.getReduced(
                                params,
                                this.ignoredParams,
                              ),
                            )}
                          >
                            {name}
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
              <Pagination
                params={params}
                updateParams={(params) =>
                  this.updateParams(params, () => this.setState({ params }))
                }
                count={usedByDependenciesCount}
              />
            </div>
          </section>
        </Main>
      </React.Fragment>
    );
  }

  private loadData() {
    this.loadCollection(() => {
      this.loadUsedByDependencies();
    });
  }

  private loadUsedByDependencies() {
    const {
      name: collection,
      namespace: { name: namespace },
    } = this.state.collection;
    CollectionAPI.getUsedDependenciesByCollection(namespace, collection).then(
      (dependencies) => {
        const mockedDependencies = [
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof1',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv2',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc3',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof4',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv5',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc6',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof7',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv8',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc9',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc10',
            version: '0.9.6',
          },

          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof1x',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv2x',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc3x',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof4x',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv5x',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc6x',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof7x',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv8x',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc9x',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc10x',
            version: '0.9.6',
          },

          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof1z',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv2z',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc3z',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof4z',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv5z',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc6z',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollsevpzzbuhof7z',
            version: '2.5.9',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollswfnzropnhv8z',
            version: '0.4.3',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc9z',
            version: '0.9.6',
          },
          {
            namespace: 'mytestcollsdtpvoomv',
            name: 'mytestcollshoqyrcukgc10z',
            version: '0.9.6',
          },
        ];

        this.setState({
          usedByDependencies: [
            ...dependencies.data.data,
            ...mockedDependencies,
          ],
        });
      },
    );
  }

  private filterUsedByDependencies(dependencies) {
    const { page, page_size, keywords, sort } = this.state.params;

    return dependencies
      .filter((d) => d.name.match(keywords))
      .sort((a, b) =>
        sort === '-name'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      )
      .slice(page_size * (page - 1), page_size * page);
  }

  private loadCollection(callback = null) {
    CollectionAPI.getCached(
      this.props.match.params['namespace'],
      this.props.match.params['collection'],
      this.context.selectedRepo,
      {},
      false,
    )
      .then((result) => {
        this.setState({ collection: result }, callback);
      })
      .catch((result) => {
        this.props.history.push(Paths.notFound);
      });
  }

  get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private separateCollectionByDependency(dependency) {
    return dependency.split('.');
  }
}

export default withRouter(CollectionDependencies);

CollectionDependencies.contextType = AppContext;
