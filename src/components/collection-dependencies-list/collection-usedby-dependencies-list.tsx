import { t } from '@lingui/macro';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { CollectionUsedByDependencies } from 'src/api';

import { Pagination, Toolbar } from 'src/components';

import { ParamHelper } from 'src/utilities/param-helper';
import { formatPath, Paths } from 'src/paths';

import 'src/containers/collection-detail/collection-dependencies.scss';

interface IProps {
  usedByDependencies: CollectionUsedByDependencies[];
  repo: string;
  itemCount: number;
  params: {
    page?: number;
    page_size?: number;
    collection?: string;
    sort?: string;
    version?: string;
    name?: string;
  };
  updateParams: (params) => void;
}

export class CollectionUsedbyDependenciesList extends React.Component<IProps> {
  private ignoredParams = ['page_size', 'page', 'sort', 'collection'];
  constructor(props) {
    super(props);
  }

  render() {
    const { params, usedByDependencies, itemCount, updateParams, repo } =
      this.props;

    const { name, ...rest } = params;

    return (
      <>
        <div className='usedby-dependencies-header'>
          <Toolbar
            params={{ ...rest, keywords: name }}
            sortOptions={[
              { title: t`Collection`, id: 'collection', type: 'alpha' },
            ]}
            searchPlaceholder={t`Filter collection name`}
            updateParams={(p) => {
              const { keywords, ...rest } = p;
              'keywords' in p
                ? updateParams({ ...rest, name: keywords })
                : updateParams(p);
            }}
          />
          <Pagination
            params={params}
            updateParams={(p) => updateParams(p)}
            count={itemCount}
            isTop
          />
        </div>

        <table className='content-table pf-c-table pf-m-compact'>
          <tbody>
            {usedByDependencies.map(({ name, namespace, version }, i) => (
              <tr key={i}>
                <td>
                  <Link
                    to={formatPath(
                      Paths.collectionByRepo,
                      {
                        collection: name,
                        namespace: namespace,
                        repo,
                      },
                      ParamHelper.getReduced({ version }, this.ignoredParams),
                    )}
                  >
                    {name}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          params={params}
          updateParams={(params) => updateParams(params)}
          count={itemCount}
        />
      </>
    );
  }
}
