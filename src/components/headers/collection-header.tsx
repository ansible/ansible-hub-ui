import * as React from 'react';
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
    const { params } = this.props;

    return (
      <div className='pf-c-tabs' id='primary'>
        <ul className='pf-c-tabs__list'>
          <li
            className={
              'pf-c-tabs__item' + (active === 'details' ? ' pf-m-current' : '')
            }
          >
            <Link
              to={formatPath(
                Paths.collection,
                {
                  namespace: this.props.collection.namespace.name,
                  collection: this.props.collection.name,
                },
                ParamHelper.getReduced(params, this.ignorParams),
              )}
              className='pf-c-tabs__button'
              id='details-tab'
            >
              Details
            </Link>
          </li>
          <li
            className={
              'pf-c-tabs__item' +
              (active === 'documentation' ? ' pf-m-current' : '')
            }
          >
            <Link
              to={formatPath(
                Paths.collectionDocsIndex,
                {
                  namespace: this.props.collection.namespace.name,
                  collection: this.props.collection.name,
                },
                ParamHelper.getReduced(params, this.ignorParams),
              )}
              className='pf-c-tabs__button'
              id='documentation-tab'
            >
              Documentation
            </Link>
          </li>
          <li
            className={
              'pf-c-tabs__item' + (active === 'contents' ? ' pf-m-current' : '')
            }
          >
            <Link
              to={formatPath(
                Paths.collectionContentList,
                {
                  namespace: this.props.collection.namespace.name,
                  collection: this.props.collection.name,
                },
                ParamHelper.getReduced(params, this.ignorParams),
              )}
              className='pf-c-tabs__button'
              id='contents-tab'
            >
              Contents
            </Link>
          </li>
          <li
            className={
              'pf-c-tabs__item' +
              (active === 'import-log' ? ' pf-m-current' : '')
            }
          >
            <Link
              to={formatPath(
                Paths.collectionImportLog,
                {
                  namespace: this.props.collection.namespace.name,
                  collection: this.props.collection.name,
                },
                ParamHelper.getReduced(params, this.ignorParams),
              )}
              className='pf-c-tabs__button'
              id='contents-tab'
            >
              Import log
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}
