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
  Pagination,
} from 'src/components';

import { CollectionDetailType } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper } from 'src/utilities/param-helper';
import { DateComponent } from '../date-component/date-component';
import { Constants } from 'src/constants';

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
  isOpenVersionsSelect: boolean;
  isOpenVersionsModal: boolean;
  modalPagination: {
    page: number;
    pageSize: number;
  };
}

export class CollectionHeader extends React.Component<IProps, IState> {
  ignoreParams = ['showing', 'keywords'];
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = {
      isOpenVersionsSelect: false,
      isOpenVersionsModal: false,
      modalPagination: {
        page: 1,
        pageSize: Constants.DEFAULT_PAGINATION_OPTIONS[1],
      },
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

    const { modalPagination, isOpenVersionsModal, isOpenVersionsSelect } =
      this.state;

    const numOfshownVersions = 10;

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
          isOpen={isOpenVersionsModal}
          title={t`Collection versions`}
          variant='small'
          onClose={() => this.setState({ isOpenVersionsModal: false })}
        >
          <List isPlain>
            <div className='versions-modal-header'>
              <Text>{t`${collectionName}'s versions.`}</Text>
              <Pagination
                isTop
                params={{
                  page: modalPagination.page,
                  page_size: modalPagination.pageSize,
                }}
                updateParams={this.updatePaginationParams}
                count={all_versions.length}
              />
            </div>
            {this.paginateVersions(all_versions).map((v, i) => (
              <ListItem key={i}>
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
                    this.setState({ isOpenVersionsModal: false });
                  }}
                >
                  v{v.version}
                </Button>{' '}
                {t`released ${isLatestVersion(v)}`}
              </ListItem>
            ))}
          </List>
          <Pagination
            params={{
              page: modalPagination.page,
              page_size: modalPagination.pageSize,
            }}
            updateParams={this.updatePaginationParams}
            count={all_versions.length}
          />
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
                  isOpen={isOpenVersionsSelect}
                  onToggle={(isOpenVersionsSelect) =>
                    this.setState({ isOpenVersionsSelect })
                  }
                  variant={SelectVariant.single}
                  onSelect={() =>
                    this.setState({ isOpenVersionsSelect: false })
                  }
                  selections={`v${collection.latest_version.version}`}
                  aria-label={t`Select collection version`}
                  loadingVariant={
                    numOfshownVersions < all_versions.length
                      ? {
                          text: t`View more`,
                          onClick: () =>
                            this.setState({
                              isOpenVersionsModal: true,
                              isOpenVersionsSelect: false,
                            }),
                        }
                      : null
                  }
                >
                  {this.renderSelectVersions(
                    all_versions,
                    numOfshownVersions,
                  ).map((v) => (
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
                const url = collection.latest_version.metadata[link.key];
                if (!url) {
                  return null;
                }

                return (
                  <div className='link' key={link.key}>
                    <a href={url} target='_blank'>
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
      {
        active: active === 'dependencies',
        title: t`Dependencies`,
        link: formatPath(
          Paths.collectionDependenciesByRepo,
          pathParams,
          reduced,
        ),
      },
    ];

    return <LinkTabs tabs={tabs} />;
  }

  private renderSelectVersions(versions, count) {
    return versions.slice(0, count);
  }

  private paginateVersions(versions) {
    const { modalPagination } = this.state;
    return versions.slice(
      modalPagination.pageSize * (modalPagination.page - 1),
      modalPagination.pageSize * modalPagination.page,
    );
  }

  private updatePaginationParams = ({ page, page_size }) => {
    this.setState({
      modalPagination: {
        page: page,
        pageSize: page_size,
      },
    });
  };
}
