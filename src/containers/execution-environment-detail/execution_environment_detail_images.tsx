import { Trans, t } from '@lingui/macro';
import {
  Button,
  Checkbox,
  Text,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import AngleDownIcon from '@patternfly/react-icons/dist/esm/icons/angle-down-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import { sum } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { type ContainerManifestType, ExecutionEnvironmentAPI } from 'src/api';
import {
  AppliedFilters,
  CompoundFilter,
  CopyURL,
  DateComponent,
  DeleteModal,
  EmptyStateFilter,
  EmptyStateNoData,
  ExternalLink,
  HubPagination,
  LabelGroup,
  ListItemActions,
  LoadingSpinner,
  ShaLabel,
  SortTable,
  TagLabel,
  TagManifestModal,
} from 'src/components';
import { AppContext, type IAppContextType } from 'src/loaders/app-context';
import { Paths, formatEEPath } from 'src/paths';
import {
  ParamHelper,
  controllerURL,
  errorMessage,
  filterIsSet,
  getContainersURL,
  getHumanSize,
  waitForTask,
  withRouter,
} from 'src/utilities';
import {
  type IDetailSharedProps,
  containerName,
  withContainerRepo,
} from './base';
import './execution-environment-detail.scss';
import './execution-environment-detail_images.scss';

interface IState {
  loading: boolean;
  images: ContainerManifestType[];
  numberOfImages: number;
  params: { page?: number; page_size?: number; sort?: string };
  redirect: string;
  inputText: string;

  // ID for manifest that is open in the manage tags modal.
  manageTagsManifestDigest: string;
  selectedImage: ContainerManifestType;
  deleteModalVisible: boolean;
  confirmDelete: boolean;
  expandedImage?: ContainerManifestType;
  isDeletionPending: boolean;
}

class ExecutionEnvironmentDetailImages extends Component<
  IDetailSharedProps,
  IState
> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }
    if (!params['page']) {
      params['page'] = 1;
    }

    this.state = {
      loading: true,
      images: [],
      numberOfImages: 0,
      params,
      redirect: null,
      manageTagsManifestDigest: undefined,
      selectedImage: undefined,
      deleteModalVisible: false,
      confirmDelete: false,
      expandedImage: null,
      isDeletionPending: false,
      inputText: '',
    };
  }

  componentDidMount() {
    this.queryImages(this.props.containerRepository.name);
  }

  render() {
    return this.renderImages();
  }

  renderImages() {
    const {
      params,
      images,
      manageTagsManifestDigest,
      selectedImage,
      deleteModalVisible,
      confirmDelete,
      loading,
      isDeletionPending,
    } = this.state;
    if (
      images.length === 0 &&
      !filterIsSet(params, ['tag', 'digest__icontains'])
    ) {
      return (
        <EmptyStateNoData
          title={t`No images yet`}
          description={t`Images will appear once uploaded`}
        />
      );
    }
    if (loading) {
      return <LoadingSpinner />;
    }
    const sortTableOptions = {
      headers: [
        {
          title: '',
          type: 'none',
          id: 'expand',
          className: 'pf-v5-c-table__toggle',
        },
        {
          title: t`Tag`,
          type: 'none',
          id: 'tag',
        },
        {
          title: t`Published`,
          type: 'none',
          id: 'published',
        },
        {
          title: t`Layers`,
          type: 'none',
          id: 'layers',
        },
        {
          title: t`Size`,
          type: 'none',
          id: 'size',
        },
        {
          title: t`Digest`,
          type: 'none',
          id: 'digest',
        },
        {
          title: '',
          type: 'none',
          id: 'instructions',
        },
        {
          title: '',
          type: 'none',
          id: 'controls',
        },
      ],
    };

    const canEditTags =
      this.props.containerRepository.namespace.my_permissions.includes(
        'container.namespace_modify_content_containerpushrepository',
      );
    const { digest } = selectedImage || {};

    return (
      <section className='body'>
        {deleteModalVisible && (
          <DeleteModal
            spinner={isDeletionPending}
            title={t`Delete image?`}
            cancelAction={() =>
              this.setState({
                deleteModalVisible: false,
                selectedImage: null,
                confirmDelete: false,
              })
            }
            deleteAction={() => this.deleteImage()}
            isDisabled={!confirmDelete || isDeletionPending}
          >
            <>
              <Text className='delete-image-modal-message'>
                <Trans>
                  Deleting <b>{digest}</b> and its data will be lost.
                </Trans>
              </Text>
            </>
            <Checkbox
              isChecked={confirmDelete}
              onChange={(_event, value) =>
                this.setState({ confirmDelete: value })
              }
              label={t`I understand that this action cannot be undone.`}
              id='delete_confirm'
            />
          </DeleteModal>
        )}
        <TagManifestModal
          isOpen={!!manageTagsManifestDigest}
          closeModal={() => this.setState({ manageTagsManifestDigest: null })}
          containerManifest={images.find(
            (el) => el.digest === manageTagsManifestDigest,
          )}
          reloadManifests={() =>
            this.queryImages(this.props.containerRepository.name)
          }
          repositoryName={this.props.containerRepository.name}
          onAlert={(alert) => this.props.addAlert(alert)}
          containerRepository={this.props.containerRepository}
        />

        <div className='hub-toolbar'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    inputText={this.state.inputText}
                    onChange={(text) => this.setState({ inputText: text })}
                    updateParams={(p) =>
                      this.updateParams(p, () =>
                        this.queryImages(containerName(this.props.routeParams)),
                      )
                    }
                    params={params}
                    filterConfig={[
                      {
                        id: 'tag',
                        title: t`Tag`,
                      },
                      {
                        id: 'digest__icontains',
                        title: t`Digest`,
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
          <HubPagination
            params={params}
            updateParams={(p) =>
              this.updateParams(p, () =>
                this.queryImages(containerName(this.props.routeParams)),
              )
            }
            count={this.state.numberOfImages}
            isTop
          />
        </div>
        <div>
          <AppliedFilters
            updateParams={(p) => {
              this.updateParams(p, () =>
                this.queryImages(containerName(this.props.routeParams)),
              );
              this.setState({ inputText: '' });
            }}
            params={params}
            ignoredParams={['page_size', 'page', 'sort', 'id', 'tab']}
          />
        </div>
        {images.length === 0 && filterIsSet(params, ['tag']) ? (
          <EmptyStateFilter />
        ) : (
          <Table aria-label={t`Images`}>
            <SortTable
              options={sortTableOptions}
              params={params}
              updateParams={(p) =>
                this.updateParams(p, () =>
                  this.queryImages(containerName(this.props.routeParams)),
                )
              }
            />
            <Tbody>
              {images.map((image, i) =>
                this.renderTableRow(
                  image,
                  i,
                  canEditTags,
                  sortTableOptions.headers.length,
                ),
              )}
            </Tbody>
          </Table>
        )}

        <HubPagination
          params={params}
          updateParams={(p) =>
            this.updateParams(p, () =>
              this.queryImages(containerName(this.props.routeParams)),
            )
          }
          count={this.state.numberOfImages}
        />
      </section>
    );
  }

  private renderTableRow(
    image,
    index: number,
    canEditTags: boolean,
    cols: number,
  ) {
    const { hasPermission } = this.context as IAppContextType;
    const container = containerName(this.props.routeParams);
    const manifestLink = (digestOrTag) =>
      formatEEPath(Paths.executionEnvironmentManifest, {
        container,
        digest: digestOrTag,
      });

    const ShaLink = ({ digest }) => (
      <Link to={manifestLink(digest)}>
        <ShaLabel digest={digest} />
      </Link>
    );
    const TagLink = ({ tag }) => (
      <Link to={manifestLink(tag)}>
        <TagLabel tag={tag} />
      </Link>
    );

    const instructions =
      'podman pull ' +
      getContainersURL({
        name: container,
        tag: image.tags?.[0],
        digest: image.digest,
      });

    const isRemote = !!this.props.containerRepository.pulp.repository.remote;
    const { isManifestList } = image;
    const { expandedImage } = this.state;

    const dropdownItems = [
      canEditTags && !isRemote && (
        <DropdownItem
          key='edit-tags'
          onClick={() => {
            this.setState({ manageTagsManifestDigest: image.digest });
          }}
        >
          {t`Manage tags`}
        </DropdownItem>
      ),
      <DropdownItem
        key='use-in-controller'
        component={
          <ExternalLink
            href={controllerURL({
              digest: image.digest,
              image: this.props.containerRepository.name,
              tag: image.tags[0],
            })}
            variant='menu'
          >
            {t`Use in Controller`}
          </ExternalLink>
        }
      />,
      hasPermission('container.delete_containerrepository') && (
        <DropdownItem
          key='delete-image'
          onClick={() => {
            this.setState({ deleteModalVisible: true, selectedImage: image });
          }}
        >
          {t`Delete`}
        </DropdownItem>
      ),
    ].filter((truthy) => truthy);

    return (
      <Fragment key={index}>
        <Tr>
          <Td className='pf-v5-c-table__toggle'>
            {isManifestList ? (
              <Button
                variant='plain'
                onClick={() =>
                  this.setState({
                    expandedImage: expandedImage === image ? null : image,
                  })
                }
              >
                {expandedImage === image ? (
                  <AngleDownIcon />
                ) : (
                  <AngleRightIcon />
                )}
              </Button>
            ) : null}
          </Td>
          <Td>
            <LabelGroup className={'hub-c-label-group-tags-column'}>
              {image.tags
                .sort()
                .map((tag) =>
                  isManifestList ? (
                    <TagLabel key={tag} tag={tag} />
                  ) : (
                    <TagLink key={tag} tag={tag} />
                  ),
                )}
            </LabelGroup>
          </Td>
          <Td>
            <DateComponent date={image.created_at} />
          </Td>
          <Td>{isManifestList ? '---' : image.layers}</Td>
          <Td>{isManifestList ? '---' : getHumanSize(image.size)}</Td>
          <Td>
            {isManifestList ? (
              <ShaLabel digest={image.digest} />
            ) : (
              <ShaLink digest={image.digest} />
            )}
          </Td>
          <Td>
            <CopyURL url={instructions} />
          </Td>
          <ListItemActions kebabItems={dropdownItems} />
        </Tr>

        {expandedImage === image && (
          <Tr>
            <Td colSpan={cols}>{this.renderManifestList(image, ShaLink)}</Td>
          </Tr>
        )}
      </Fragment>
    );
  }

  renderManifestList({ image_manifests }, ShaLink) {
    return (
      <Table>
        <SortTable
          options={{
            headers: [
              {
                title: t`Digest`,
                type: 'none',
                id: 'digest',
              },
              {
                title: t`OS / Arch`,
                type: 'none',
                id: 'os_arch',
              },
            ],
          }}
          params={{}}
          updateParams={() => null}
        />
        <Tbody>
          {image_manifests.map(
            ({
              digest,
              os,
              os_version,
              os_features,
              architecture,
              variant,
              features,
            }) => (
              <Tr key={digest}>
                <Td>
                  <ShaLink digest={digest} />
                </Td>
                <Td>
                  {[
                    os,
                    os_version,
                    os_features,
                    '/',
                    architecture,
                    variant,
                    features,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </Td>
              </Tr>
            ),
          )}
        </Tbody>
      </Table>
    );
  }

  queryImages(name) {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.images(name, {
        ...this.state.params,
        exclude_child_manifests: true,
      })
        .then(({ data: { data, meta } }) => {
          const images = data.map(
            ({
              digest,
              image_manifests,
              layers,
              media_type,
              created_at,
              tags,
            }) => ({
              digest,
              image_manifests,
              isManifestList: !!media_type.match('manifest.list'),
              layers: layers.length,
              created_at,
              size: sum(layers.map((l) => l.size || 0)),
              tags,
            }),
          );

          this.setState({
            images,
            numberOfImages: meta.count,
            loading: false,
          });
        })
        .catch(() => this.setState({ redirect: 'notFound' })),
    );
  }

  private deleteImage() {
    const { selectedImage } = this.state;
    const { digest } = selectedImage;
    this.setState({ isDeletionPending: true }, () =>
      ExecutionEnvironmentAPI.deleteImage(
        containerName(this.props.routeParams),
        selectedImage.digest,
      )
        .then((result) => {
          const taskId = result.data.task.split('tasks/')[1].replace('/', '');
          this.setState({
            selectedImage: null,
          });
          waitForTask(taskId).then(() => {
            this.setState({
              isDeletionPending: false,
              confirmDelete: false,
              deleteModalVisible: false,
            });
            this.props.addAlert({
              variant: 'success',
              title: (
                <Trans>
                  Image &quot;{digest}&quot; has been successfully deleted.
                </Trans>
              ),
            });
            this.queryImages(containerName(this.props.routeParams));
          });
        })
        .catch((err) => {
          const { status, statusText } = err.response;
          this.setState({
            deleteModalVisible: false,
            selectedImage: null,
            confirmDelete: false,
            isDeletionPending: false,
          });
          this.props.addAlert({
            variant: 'danger',
            title: t`Image "${digest}" could not be deleted.`,
            description: errorMessage(status, statusText),
          });
        }),
    );
  }

  private updateParams(params, callback = null) {
    ParamHelper.updateParams({
      params,
      navigate: (to) => this.props.navigate(to),
      setState: (state) => this.setState(state, callback),
    });
  }
}

export default withRouter(withContainerRepo(ExecutionEnvironmentDetailImages));
