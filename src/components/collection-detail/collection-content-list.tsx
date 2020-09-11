import * as React from 'react';
import cx from 'classnames';
import './collection-content-list.scss';

import { Link } from 'react-router-dom';
import {
  TextInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { ContentSummaryType } from '../../api';
import { Paths, formatPath } from '../../paths';
import { ParamHelper } from '../../utilities/param-helper';
import { AppContext } from '../../loaders/app-context';
import { Constants } from '../../constants';

interface IProps {
  contents: ContentSummaryType[];
  collection: string;
  namespace: string;
  params: {
    keywords?: string;
    showing?: string;
  };
  updateParams: (p) => void;
}

export class CollectionContentList extends React.Component<IProps> {
  ignoredParams = ['keywords', 'showing'];
  static contextType = AppContext;

  render() {
    const {
      contents,
      collection,
      namespace,
      params,
      updateParams,
    } = this.props;

    let toShow: ContentSummaryType[] = [];
    const summary = { all: 0 };
    const showing = params.showing || 'all';
    const keywords = params.keywords || '';

    for (let c of contents) {
      summary['all']++;
      if (summary[c.content_type]) {
        summary[c.content_type]++;
      } else {
        summary[c.content_type] = 1;
      }

      const typeMatch = showing === 'all' ? true : c.content_type === showing;

      if (typeMatch && c.name.match(keywords)) {
        toShow.push(c);
      }
    }

    return (
      <div>
        <div>
          <Toolbar>
            <ToolbarGroup>
              <ToolbarItem>
                <TextInput
                  value={params.keywords || ''}
                  onChange={val =>
                    updateParams(ParamHelper.setParam(params, 'keywords', val))
                  }
                  aria-label='find-content'
                  placeholder='Find content'
                />
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup>
              <ToolbarItem>Showing:</ToolbarItem>
              {Object.keys(summary).map(key => (
                <ToolbarItem
                  key={key}
                  className={cx({
                    clickable: true,
                    'selected-item': key === showing,
                    'type-selector': true,
                  })}
                  onClick={() =>
                    updateParams(ParamHelper.setParam(params, 'showing', key))
                  }
                >
                  {key} ({summary[key]})
                </ToolbarItem>
              ))}
            </ToolbarGroup>
          </Toolbar>
        </div>
        <table className='content-table pf-c-table pf-m-compact'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {toShow.map((content, i) => (
              <tr key={i}>
                <td>
                  <Link
                    to={formatPath(
                      Paths.collectionContentDocsByRepo,
                      {
                        collection: collection,
                        namespace: namespace,
                        type: content.content_type,
                        name: content.name,
                        repo:
                          Constants.REPOSITORYNAMES[this.context.selectedRepo],
                      },
                      ParamHelper.getReduced(params, this.ignoredParams),
                    )}
                  >
                    {content.name}
                  </Link>
                </td>
                <td>{content.content_type}</td>
                <td>{content.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
