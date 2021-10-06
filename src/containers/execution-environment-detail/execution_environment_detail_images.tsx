import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import './execution-environment-detail.scss';

import { sum } from 'lodash';
import { ExecutionEnvironmentAPI, ContainerManifestType } from 'src/api';
import { formatPath, Paths } from 'src/paths';
import {
  ParamHelper,
  filterIsSet,
  getContainersURL,
  getHumanSize,
  waitForTask,
} from 'src/utilities';

import { Link, withRouter } from 'react-router-dom';

import {
  Button,
  Checkbox,
  DropdownItem,
  LabelGroup,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { AngleDownIcon, AngleRightIcon } from '@patternfly/react-icons';

import {
  AppliedFilters,
  CompoundFilter,
  Pagination,
  SortTable,
  EmptyStateNoData,
  EmptyStateFilter,
  ShaLabel,
  TagLabel,
  PublishToControllerModal,
  StatefulDropdown,
  AlertList,
  closeAlertMixin,
  AlertType,
  DateComponent,
  ClipboardCopy,
  DeleteModal,
  LoadingPageWithHeader,
  LoadingPageSpinner,
} from '../../components';

import { TagManifestModal } from './tag-manifest-modal';

import { withContainerRepo, IDetailSharedProps } from './base';
import './execution-environment-detail_images.scss';

interface IState {
  loading: boolean;
  images: ContainerManifestType[];
  numberOfImages: number;
  params: { page?: number; page_size?: number };
  redirect: string;
  alerts: AlertType[];

  // ID for manifest that is open in the manage tags modal.
  manageTagsManifestDigest: string;
  publishToController: { digest?: string; image: string; tag?: string };
  selectedImage: ContainerManifestType;
  deleteModalVisible: boolean;
  confirmDelete: boolean;
  expandedImage?: ContainerManifestType;
}

class ExecutionEnvironmentDetailImages extends React.Component<
  IDetailSharedProps,
  IState
> {
  nonQueryStringParams = [];

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
      params: params,
      redirect: null,
      manageTagsManifestDigest: undefined,
      publishToController: null,
      selectedImage: undefined,
      deleteModalVisible: false,
      alerts: [],
      confirmDelete: false,
      expandedImage: null,
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
      publishToController,
      selectedImage,
      deleteModalVisible,
      confirmDelete,
      loading,
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
      return <LoadingPageSpinner />;
    }
    const sortTableOptions = {
      headers: [
        {
          title: '',
          type: 'none',
          id: 'expand',
          className: 'pf-c-table__toggle',
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
        <AlertList
          alerts={this.state.alerts}
          closeAlert={(i) => this.closeAlert(i)}
        />
        {deleteModalVisible && (
          <DeleteModal
            title={t`Permanently delete image`}
            cancelAction={() =>
              this.setState({
                deleteModalVisible: false,
                selectedImage: null,
                confirmDelete: false,
              })
            }
            deleteAction={() => this.deleteImage()}
            isDisabled={!confirmDelete}
          >
            <Trans>
              Deleting <b>{digest}</b> and its data will be lost.
            </Trans>
            <Checkbox
              isChecked={confirmDelete}
              onChange={(value) => this.setState({ confirmDelete: value })}
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
          onAlert={(alert) => {
            this.setState({ alerts: this.state.alerts.concat(alert) });
          }}
          containerRepository={this.props.containerRepository}
        />
        <PublishToControllerModal
          digest={publishToController?.digest}
          image={publishToController?.image}
          isOpen={!!publishToController}
          onClose={() => this.setState({ publishToController: null })}
          tag={publishToController?.tag}
        />

        <div className='toolbar'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    updateParams={(p) =>
                      this.updateParams(p, () =>
                        this.queryImages(this.props.match.params['container']),
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
          <Pagination
            params={params}
            updateParams={(p) =>
              this.updateParams(p, () =>
                this.queryImages(this.props.match.params['container']),
              )
            }
            count={this.state.numberOfImages}
            isTop
          />
        </div>
        <div>
          <AppliedFilters
            updateParams={(p) =>
              this.updateParams(p, () =>
                this.queryImages(this.props.match.params['container']),
              )
            }
            params={params}
            ignoredParams={['page_size', 'page', 'sort', 'id', 'tab']}
          />
        </div>
        {images.length === 0 && filterIsSet(params, ['tag']) ? (
          <EmptyStateFilter />
        ) : (
          <table aria-label={t`Images`} className='content-table pf-c-table'>
            <SortTable
              options={sortTableOptions}
              params={params}
              updateParams={(p) =>
                this.updateParams(p, () =>
                  this.queryImages(this.props.match.params['container']),
                )
              }
            />
            <tbody>
              {images.map((image, i) =>
                this.renderTableRow(
                  image,
                  i,
                  canEditTags,
                  sortTableOptions.headers.length,
                ),
              )}
            </tbody>
          </table>
        )}
        <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
          <Pagination
            params={params}
            updateParams={(p) =>
              this.updateParams(p, () =>
                this.queryImages(this.props.match.params['container']),
              )
            }
            count={this.state.numberOfImages}
          />
        </div>
      </section>
    );
  }

  private renderTableRow(
    image,
    index: number,
    canEditTags: boolean,
    cols: number,
  ) {
    const manifestLink = (digestOrTag) =>
      formatPath(Paths.executionEnvironmentManifest, {
        container: this.props.match.params['container'],
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

    const url = getContainersURL();
    let instruction =
      image.tags.length === 0
        ? image.digest
        : this.props.match.params['container'] + ':' + image.tags[0];

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
        key='publish-to-controller'
        onClick={() => {
          this.setState({
            publishToController: {
              digest: image.digest,
              image: this.props.containerRepository.name,
              tag: image.tags[0],
            },
          });
        }}
      >
        {t`Use in Controller`}
      </DropdownItem>,
      <DropdownItem
        key='delete-image'
        onClick={() => {
          this.setState({ deleteModalVisible: true, selectedImage: image });
        }}
      >
        {t`Delete`}
      </DropdownItem>,
    ].filter((truthy) => truthy);

    return (
      <>
        <tr key={index}>
          <td className='pf-c-table__toggle'>
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
          </td>
          <td>
            <LabelGroup className={'tags-column'}>
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
          </td>
          <td>
            <DateComponent date={image.pulp_created} />
          </td>
          <td>{isManifestList ? '---' : image.layers}</td>
          <td>{isManifestList ? '---' : getHumanSize(image.size)}</td>
          <td>
            {isManifestList ? (
              <ShaLabel digest={image.digest} />
            ) : (
              <ShaLink digest={image.digest} />
            )}
          </td>
          <td>
            <ClipboardCopy isReadOnly>
              {'podman pull ' + url + '/' + instruction}
            </ClipboardCopy>
          </td>

          <td>
            {dropdownItems.length && (
              <StatefulDropdown items={dropdownItems}></StatefulDropdown>
            )}
          </td>
        </tr>

        {expandedImage === image && (
          <tr>
            <td colSpan={cols}>{this.renderManifestList(image, ShaLink)}</td>
          </tr>
        )}
      </>
    );
  }

  renderManifestList({ image_manifests }, ShaLink) {
    return (
      <table className='content-table pf-c-table'>
        <SortTable
          options={{
            headers: [
              {
                title: t`Digest`,
                type: 'none',
                id: 'digest',
              },
              {
                title: t`OS/Arch`,
                type: 'none',
                id: 'os_arch',
              },
            ],
          }}
          params={{}}
          updateParams={(p) => null}
        />
        <tbody>
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
              <tr>
                <td>
                  <ShaLink digest={digest} />
                </td>
                <td>
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
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    );
  }

  queryImages(name) {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.images(name, {
        ...ParamHelper.getReduced(this.state.params, this.nonQueryStringParams),
        exclude_child_manifests: true,
      })
        .then(({ data: { data, meta } }) => {
          const images = data.map(
            ({
              digest,
              image_manifests,
              layers,
              media_type,
              pulp_created,
              tags,
            }) => ({
              digest,
              image_manifests,
              isManifestList: !!media_type.match('manifest.list'),
              layers: layers.length,
              pulp_created,
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
        .catch((error) => this.setState({ redirect: 'notFound' })),
    );
  }

  private deleteImage() {
    const { selectedImage } = this.state;
    const { digest } = selectedImage;
    ExecutionEnvironmentAPI.deleteImage(
      this.props.match.params['container'],
      selectedImage.digest,
    )
      .then((result) => {
        let taskId = result.data.task.split('tasks/')[1].replace('/', '');
        this.setState({
          loading: true,
          deleteModalVisible: false,
          selectedImage: null,
          confirmDelete: false,
        });
        waitForTask(taskId).then(() => {
          this.setState({
            alerts: this.state.alerts.concat([
              {
                variant: 'success',
                title: t`Success: ${digest} was deleted`,
              },
            ]),
          });
          this.queryImages(this.props.match.params['container']);
        });
      })
      .catch(() => {
        this.setState({
          deleteModalVisible: false,
          selectedImage: null,
          confirmDelete: false,
          alerts: this.state.alerts.concat([
            { variant: 'danger', title: t`Error: delete failed` },
          ]),
        });
      });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(withContainerRepo(ExecutionEnvironmentDetailImages));
