import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './header.scss';

import * as moment from 'moment';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  Select,
  SelectOption,
  SelectVariant,
  List,
  ListItem,
  Modal,
  Alert,
  Text,
  Button,
} from '@patternfly/react-core';
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

interface IState {
  isOpenSelect: boolean;
  isOpenShowMoreModal: boolean;
}

export class CollectionHeader extends React.Component<IProps, IState> {
  ignoreParams = ['showing', 'keyords'];
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = {
      isOpenSelect: false,
      isOpenShowMoreModal: false,
    };
  }

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

    const isLatestVersion = (v) =>
      `${moment(v.created).fromNow()} ${
        v.version === all_versions[0].version ? t`(latest)` : ''
      }`;

    const { name: collectionName } = collection;

    return (
      <React.Fragment>
        <Modal
          isOpen={this.state.isOpenShowMoreModal}
          title={t`Collection versions`}
          variant='small'
          onClose={() => this.setState({ isOpenShowMoreModal: false })}
        >
          <List isPlain>
            <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
              {t`${collectionName}'s versions.`}
            </Text>
            {all_versions.map((v) => (
              <ListItem key={v.version}>
                <Button
                  variant='link'
                  isInline
                  onClick={() => {
                    updateParams(
                      ParamHelper.setParam(
                        params,
                        'version',
                        v.version.toString(),
                      ),
                    );
                    this.setState({ isOpenShowMoreModal: false });
                  }}
                >
                  v{v.version}
                </Button>{' '}
                {t`released ${isLatestVersion(v)}`}
              </ListItem>
            ))}
          </List>
        </Modal>
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
                <Select
                  isOpen={this.state.isOpenSelect}
                  onToggle={(isOpenSelect) => this.setState({ isOpenSelect })}
                  variant={SelectVariant.single}
                  onSelect={() => this.setState({ isOpenSelect: false })}
                  selections={`v${collection.latest_version.version}`}
                  aria-label={t`Select collection version`}
                  loadingVariant={{
                    text: t`Show more`,
                    onClick: () => this.setState({ isOpenShowMoreModal: true }),
                  }}
                >
                  {all_versions.map((v) => (
                    <SelectOption
                      key={v.version}
                      value={`v${v.version}`}
                      onClick={() =>
                        updateParams(
                          ParamHelper.setParam(
                            params,
                            'version',
                            v.version.toString(),
                          ),
                        )
                      }
                    >
                      <Trans>
                        {v.version} released {isLatestVersion(v)}
                      </Trans>
                    </SelectOption>
                  ))}
                </Select>
              </div>
              {latestVersion ? (
                <span className='last-updated'>
                  <Trans>
                    Last updated <DateComponent date={latestVersion} />
                  </Trans>
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
      </React.Fragment>
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
