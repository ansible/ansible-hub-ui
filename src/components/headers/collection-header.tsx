import * as React from 'react';
import cx from 'classnames';
import './header.scss';

import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { FormSelect, FormSelectOption, Alert } from '@patternfly/react-core';
import { AppContext } from 'src/loaders/app-context';

import {
  BaseHeader,
  Breadcrumbs,
  LinkTabs,
  RepoSelector,
} from 'src/components';
import { CollectionDetailType } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper } from 'src/utilities/param-helper';
import { DateComponent } from '../date-component/date-component';

interface IProps {
  collection: CollectionDetailType;
  params: {
    version?: string;
    latestVersion?: string;
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
  ignoreParams = ['showing', 'keyords'];
  static contextType = AppContext;

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
      (x) => x.version === collection.latest_version.version,
    );

    if (!match) {
      all_versions.push({
        id: collection.latest_version.id,
        version: collection.latest_version.version,
        created: collection.latest_version.created_at,
      });
    }

    const urlKeys = [
      { key: 'documentation', name: t`Docs site` },
      { key: 'homepage', name: t`Website` },
      { key: 'issues', name: t`Issue tracker` },
      { key: 'repository', name: t`Repo` },
    ];

    const latestVersion = collection.latest_version.created_at;

    return (
      <BaseHeader
        className={className}
        title={collection.name}
        imageURL={collection.namespace.avatar_url}
        contextSelector={
          <RepoSelector
            selectedRepo={this.context.selectedRepo}
            path={Paths.searchByRepo}
            isDisabled
          />
        }
        breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
        versionControl={
          <div className='install-version-column'>
            <span>{t`Version`}</span>
            <div className='install-version-dropdown'>
              <FormSelect
                onChange={(val) =>
                  updateParams(ParamHelper.setParam(params, 'version', val))
                }
                value={collection.latest_version.version}
                aria-label={t`Select collection version`}
              >
                {all_versions.map((v) => (
                  <FormSelectOption
                    key={v.version}
                    value={v.version}
                    label={'v' + v.version}
                  />
                ))}
              </FormSelect>
            </div>
            {latestVersion ? (
              <span className='last-updated'>
                Last updated{' '}
                <DateComponent date={latestVersion}></DateComponent>
              </span>
            ) : null}
          </div>
        }
      >
        {collection.deprecated && (
          <Alert
            variant='danger'
            isInline
            title={t`This collection has been deprecated.`}
          />
        )}
        <div className='tab-link-container'>
          <div className='tabs'>{this.renderTabs(activeTab)}</div>
          <div className='links'>
            <div>
              <ExternalLinkAltIcon />
            </div>
            {urlKeys.map((link) => {
              const l = collection.latest_version.metadata[link.key];
              if (!l) {
                return null;
              }

              return (
                <div className='link' key={link.key}>
                  <a href={l} target='_blank'>
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
    const { params, repo } = this.props;

    const pathParams = {
      namespace: this.props.collection.namespace.name,
      collection: this.props.collection.name,
      repo: repo,
    };
    const reduced = ParamHelper.getReduced(params, this.ignoreParams);

    const tabs = [
      {
        active: active === 'install',
        title: t`Install`,
        link: formatPath(Paths.collectionByRepo, pathParams, reduced),
      },
      {
        active: active === 'documentation',
        title: t`Documentation`,
        link: formatPath(Paths.collectionDocsIndexByRepo, pathParams, reduced),
      },
      {
        active: active === 'contents',
        title: t`Contents`,
        link: formatPath(
          Paths.collectionContentListByRepo,
          pathParams,
          reduced,
        ),
      },
      {
        active: active === 'import-log',
        title: t`Import log`,
        link: formatPath(Paths.collectionImportLogByRepo, pathParams, reduced),
      },
    ];

    return <LinkTabs tabs={tabs} />;
  }
}
