import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './header.scss';

import { Redirect, Link } from 'react-router-dom';

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
  DropdownItem,
  Tooltip,
  Checkbox,
} from '@patternfly/react-core';
import { AppContext } from 'src/loaders/app-context';

import {
  BaseHeader,
  Breadcrumbs,
  LinkTabs,
  Logo,
  RepoSelector,
  Pagination,
  AlertList,
  AlertType,
  closeAlertMixin,
  ConfirmModal,
  StatefulDropdown,
} from 'src/components';

import { CollectionAPI, CollectionDetailType } from 'src/api';
import { Paths, formatPath } from 'src/paths';
import { waitForTask } from 'src/utilities';
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
  deleteCollection: CollectionDetailType;
  collectionVersion: string | null;
  confirmDelete: boolean;
  alerts: AlertType[];
  redirect: string;
  noDependencies: boolean;
  isDeletionPending: boolean;
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
      deleteCollection: null,
      collectionVersion: null,
      confirmDelete: false,
      alerts: [],
      redirect: null,
      noDependencies: false,
      isDeletionPending: false,
    };
  }

  componentDidMount() {
    this.getUsedbyDependencies();
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

    const {
      modalPagination,
      isOpenVersionsModal,
      isOpenVersionsSelect,
      redirect,
      noDependencies,
      collectionVersion,
      deleteCollection,
      confirmDelete,
      isDeletionPending,
    } = this.state;

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
    const company = collection.namespace.company || collection.namespace.name;

    if (redirect) return <Redirect push to={redirect} />;

    const dropdownItems = [
      noDependencies
        ? this.context.user.model_permissions.delete_collection && (
            <DropdownItem
              key={1}
              onClick={() => this.openDeleteModalWithConfirm()}
            >
              {t`Delete entire collection`}
            </DropdownItem>
          )
        : this.context.user.model_permissions.delete_collection && (
            <Tooltip
              position='left'
              content={
                <Trans>
                  Cannot delete until collections <br />
                  that depend on this collection <br />
                  have been deleted.
                </Trans>
              }
            >
              <DropdownItem isDisabled>
                {t`Delete entire collection`}
              </DropdownItem>
            </Tooltip>
          ),
      this.context.user.model_permissions.delete_collection && (
        <DropdownItem
          key='2'
          onClick={() =>
            this.openDeleteModalWithConfirm(collection.latest_version.version)
          }
        >
          {t`Delete version ${collection.latest_version.version}`}
        </DropdownItem>
      ),
    ].filter(Boolean);

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
        {deleteCollection && (
          <ConfirmModal
            spinner={isDeletionPending}
            cancelAction={this.closeModal}
            confirmAction={() =>
              this.setState({ isDeletionPending: true }, () => {
                !!collectionVersion
                  ? this.deleteCollectionVersion(collectionVersion)
                  : this.deleteCollection();
              })
            }
            isDisabled={!confirmDelete || isDeletionPending}
            title={
              collectionVersion
                ? t`Permanently delete collection version`
                : t`Permanently delete collection`
            }
            confirmButtonTitle={t`Delete`}
          >
            <>
              <Text style={{ paddingBottom: 'var(--pf-global--spacer--md)' }}>
                {collectionVersion ? (
                  <>
                    {deleteCollection.all_versions.length === 1 ? (
                      <Trans>
                        Deleting{' '}
                        <b>
                          {deleteCollection.name} v{collectionVersion}
                        </b>{' '}
                        and its data will be lost and this will cause the entire
                        collection to be deleted.
                      </Trans>
                    ) : (
                      <Trans>
                        Deleting{' '}
                        <b>
                          {deleteCollection.name} v{collectionVersion}
                        </b>{' '}
                        and its data will be lost.
                      </Trans>
                    )}
                  </>
                ) : (
                  <Trans>
                    Deleting <b>{deleteCollection.name}</b> and its data will be
                    lost.
                  </Trans>
                )}
              </Text>
              <Checkbox
                isChecked={confirmDelete}
                onChange={(val) => this.setState({ confirmDelete: val })}
                label={t`I understand that this action cannot be undone.`}
                id='delete_confirm'
              />
            </>
          </ConfirmModal>
        )}
        <BaseHeader
          className={className}
          title={collection.name}
          logo={
            collection.namespace.avatar_url && (
              <Logo
                alt={t`${company} logo`}
                className='image'
                fallbackToDefault
                image={collection.namespace.avatar_url}
                size='40px'
                unlockWidth
              />
            )
          }
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
          pageControls={
            dropdownItems.length > 0 ? (
              <StatefulDropdown items={dropdownItems} />
            ) : null
          }
        >
          {collection.deprecated && (
            <Alert
              variant='danger'
              isInline
              title={t`This collection has been deprecated.`}
            />
          )}
          <AlertList
            alerts={this.state.alerts}
            closeAlert={(i) => this.closeAlert(i)}
          />
          <div className='hub-tab-link-container'>
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

  private deleteCollectionVersion = (collectionVersion) => {
    const { deleteCollection } = this.state;

    CollectionAPI.deleteCollectionVersion(
      this.context.selectedRepo,
      deleteCollection,
    )
      .then((res) => {
        const taskId = this.getIdFromTask(res.data.task);

        waitForTask(taskId).then(() => {
          if (deleteCollection.all_versions.length > 1) {
            const topVersion = deleteCollection.all_versions.filter(
              ({ version }) => version !== collectionVersion,
            );
            this.props.updateParams(
              ParamHelper.setParam(
                this.props.params,
                'version',
                topVersion[0].version,
              ),
            );

            this.setState({
              deleteCollection: null,
              collectionVersion: null,
              isDeletionPending: false,
              alerts: [
                ...this.state.alerts,
                {
                  variant: 'success',
                  title: t`Successfully deleted collection version.`,
                },
              ],
            });
          } else {
            // last version in collection => collection will be deleted => redirect
            this.context.setAlerts([
              ...this.context.alerts,
              {
                variant: 'success',
                title: t`Successfully deleted collection.`,
              },
            ]);
            this.setState({
              redirect: formatPath(Paths.namespaceByRepo, {
                repo: this.context.selectedRepo,
                namespace: deleteCollection.namespace.name,
              }),
            });
          }
        });
      })
      .catch((err) => {
        const {
          data: { detail, dependent_collection_versions },
          status,
        } = err?.response;

        if (status === 400) {
          const dependencies = (
            <>
              <Trans>Dependent collections</Trans>
              <List className='dependent-collections-alert-list'>
                {dependent_collection_versions.map((d) => (
                  <ListItem key={d}>{d}</ListItem>
                ))}
              </List>
            </>
          );
          this.setState({
            deleteCollection: null,
            collectionVersion: null,
            isDeletionPending: false,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: detail,
                description: dependencies,
              },
            ],
          });
        } else {
          this.setState({
            deleteCollection: null,
            collectionVersion: null,
            isDeletionPending: false,
            alerts: [
              ...this.state.alerts,
              {
                variant: 'danger',
                title: t`Error deleting collection version.`,
                description: err?.message,
              },
            ],
          });
        }
      });
  };

  private deleteCollection = () => {
    const { deleteCollection } = this.state;
    CollectionAPI.deleteCollection(this.context.selectedRepo, deleteCollection)
      .then((res) => {
        const taskId = this.getIdFromTask(res.data.task);

        waitForTask(taskId).then(() => {
          this.context.setAlerts([
            ...this.context.alerts,
            {
              variant: 'success',
              title: t`Successfully deleted collection.`,
            },
          ]);
          this.setState({
            collectionVersion: null,
            deleteCollection: null,
            isDeletionPending: false,
            redirect: formatPath(Paths.namespaceByRepo, {
              repo: this.context.selectedRepo,
              namespace: deleteCollection.namespace.name,
            }),
          });
        });
      })
      .catch((err) =>
        this.setState({
          collectionVersion: null,
          deleteCollection: null,
          isDeletionPending: false,
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error deleting collection.`,
              description: err?.message,
            },
          ],
        }),
      );
  };

  private openDeleteModalWithConfirm(version = null) {
    this.setState({
      deleteCollection: this.props.collection,
      collectionVersion: version,
      confirmDelete: false,
    });
  }

  private getUsedbyDependencies() {
    const { name, namespace } = this.props.collection;
    CollectionAPI.getUsedDependenciesByCollection(namespace.name, name)
      .then(({ data }) => {
        this.setState({ noDependencies: !data.data.length });
      })
      .catch((err) =>
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error getting collection's dependencies.`,
              description: err?.message,
            },
          ],
        }),
      );
  }

  private getIdFromTask(task) {
    return task.match(/tasks\/([a-zA-Z0-9-]+)/i)[1];
  }
  private closeModal = () => {
    this.setState({ deleteCollection: null });
  };

  get closeAlert() {
    return closeAlertMixin('alerts');
  }
}
