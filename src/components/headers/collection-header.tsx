import * as React from 'react';
import cx from 'classnames';
import './header.scss';

import { Link } from 'react-router-dom';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { FormSelect, FormSelectOption, Alert } from '@patternfly/react-core';

import { BaseHeader, Breadcrumbs, APIButton } from '../../components';
import { CollectionDetailType } from '../../api';
import { Paths, formatPath } from '../../paths';
import { ParamHelper } from '../../utilities/param-helper';

interface IProps {
  collection: CollectionDetailType;
  params: {
    version?: string;
  };
  updateParams: (params) => void;
  breadcrumbs: {
    url?: string;
    name: string;
  }[];
  activeTab: string;
  className?: string;
  repo?: string;
}

export class CollectionHeader extends React.Component<IProps> {
  ignorParams = ['showing', 'keyords'];

  render() {
    const {
      collection,
      params,
      updateParams,
      breadcrumbs,
      activeTab,
      className,
    } = this.props;

    const all_versions = [...collection.all_versions];

    const match = all_versions.find(
      x => x.version === collection.latest_version.version,
    );

    if (!match) {
      all_versions.push({
        id: collection.latest_version.id,
        version: collection.latest_version.version,
        created: collection.latest_version.created_at,
      });
    }

    const urlKeys = [
      { key: 'documentation', name: 'Docs site' },
      { key: 'homepage', name: 'Website' },
      { key: 'issues', name: 'Issue tracker' },
      { key: 'repository', name: 'Repo' },
    ];

    return (
      <BaseHeader
        className={className}
        title={collection.name}
        imageURL={collection.namespace.avatar_url}
        breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
        pageControls={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <APIButton style={{ marginRight: '8px' }} />
            <FormSelect
              onChange={val =>
                updateParams(ParamHelper.setParam(params, 'version', val))
              }
              value={collection.latest_version.version}
              aria-label='Select collection version'
            >
              {all_versions.map(v => (
                <FormSelectOption
                  key={v.version}
                  value={v.version}
                  label={'v' + v.version}
                />
              ))}
            </FormSelect>
          </div>
        }
      >
        {collection.deprecated && (
          <Alert
            variant='danger'
            isInline
            title='This collection has been deprecated.'
          />
        )}
        <div className='tab-link-container'>
          <div className='tabs'>{this.renderTabs(activeTab)}</div>
          <div className='links'>
            <div>
              <ExternalLinkAltIcon />
            </div>
            {urlKeys.map(link => {
              const l = collection.latest_version.metadata[link.key];
              if (!l) {
                return null;
              }

              return (
                <div className='link' key={link.key}>
                  <a href={l} target='blank'>
                    {link.name}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </BaseHeader>
    );
  }

  private renderTabs(active) {
    // We're not using the Tab react component because they don't support
    // links.
    const { params, repo } = this.props;

    return (
      <div className='pf-c-tabs' id='primary'>
        <ul className='pf-c-tabs__list'>
          {this.renderTab(
            active === 'details',
            'Details',
            formatPath(
              Paths.collectionByRepo,
              {
                namespace: this.props.collection.namespace.name,
                collection: this.props.collection.name,
                repo: repo,
              },
              ParamHelper.getReduced(params, this.ignorParams),
            ),
          )}

          {this.renderTab(
            active === 'documentation',
            'Documentation',
            formatPath(
              Paths.collectionDocsIndexByRepo,
              {
                namespace: this.props.collection.namespace.name,
                collection: this.props.collection.name,
                repo: repo,
              },
              ParamHelper.getReduced(params, this.ignorParams),
            ),
          )}

          {this.renderTab(
            active === 'contents',
            'Contents',
            formatPath(
              Paths.collectionContentListByRepo,
              {
                namespace: this.props.collection.namespace.name,
                collection: this.props.collection.name,
                repo: repo,
              },
              ParamHelper.getReduced(params, this.ignorParams),
            ),
          )}

          {this.renderTab(
            active === 'import-log',
            'Import log',
            formatPath(
              Paths.collectionImportLogByRepo,
              {
                namespace: this.props.collection.namespace.name,
                collection: this.props.collection.name,
                repo: repo,
              },
              ParamHelper.getReduced(params, this.ignorParams),
            ),
          )}
        </ul>
      </div>
    );
  }

  private renderTab(active, title, link) {
    return (
      <li
        className={cx({
          'pf-c-tabs__item': true,
          'pf-m-current': active,
        })}
      >
        <Link to={link} className='pf-c-tabs__link' id='details-tab'>
          <span className='pf-c-tabs__item-text'>{title}</span>
        </Link>
      </li>
    );
  }
}
