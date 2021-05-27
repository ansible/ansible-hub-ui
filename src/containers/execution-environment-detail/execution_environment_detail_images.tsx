import * as React from 'react';
import './execution-environment-detail.scss';

import { pickBy } from 'lodash';
import { ImagesAPI, ContainerManifestType } from '../../api';
import { formatPath, Paths } from '../../paths';
import { filterIsSet, ParamHelper, getHumanSize } from '../../utilities';

import { Link, withRouter } from 'react-router-dom';

import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ClipboardCopy,
  DropdownItem,
  LabelGroup,
} from '@patternfly/react-core';

import {
  AppliedFilters,
  CompoundFilter,
  Pagination,
  SortTable,
  EmptyStateNoData,
  EmptyStateFilter,
  ShaLabel,
  TagLabel,
  StatefulDropdown,
  AlertList,
  closeAlertMixin,
  AlertType,
  DateComponent,
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
      alerts: [],
    };
  }

  componentDidMount() {
    this.queryImages(this.props.containerRepository.name);
  }

  render() {
    return this.renderImages();
  }

  renderImages() {
    const { params, images, manageTagsManifestDigest } = this.state;
    if (
      images.length === 0 &&
      !filterIsSet(params, ['tag', 'digest__icontains'])
    ) {
      return (
        <EmptyStateNoData
          title={'No images yet'}
          description={'Images will appear once uploaded'}
        />
      );
    }
    const sortTableOptions = {
      headers: [
        {
          title: 'Tag',
          type: 'none',
          id: 'tag',
        },
        {
          title: 'Published',
          type: 'none',
          id: 'published',
        },
        {
          title: 'Layers',
          type: 'none',
          id: 'layers',
        },
        {
          title: 'Size',
          type: 'none',
          id: 'size',
        },
        {
          title: 'Digest',
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

    const canEditTags = this.props.containerRepository.namespace.my_permissions.includes(
      'container.namespace_modify_content_containerpushrepository',
    );

    return (
      <section className='body'>
        <AlertList
          alerts={this.state.alerts}
          closeAlert={i => this.closeAlert(i)}
        />
        <TagManifestModal
          isOpen={!!manageTagsManifestDigest}
          closeModal={() => this.setState({ manageTagsManifestDigest: null })}
          containerManifest={images.find(
            el => el.digest === manageTagsManifestDigest,
          )}
          reloadManifests={() =>
            this.queryImages(this.props.containerRepository.name)
          }
          repositoryName={this.props.containerRepository.name}
          onAlert={alert => {
            this.setState({ alerts: this.state.alerts.concat(alert) });
          }}
          containerRepository={this.props.containerRepository}
        />

        <div className='toolbar'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    updateParams={p =>
                      this.updateParams(p, () =>
                        this.queryImages(this.props.match.params['container']),
                      )
                    }
                    params={params}
                    filterConfig={[
                      {
                        id: 'tag',
                        title: 'Tag',
                      },
                      {
                        id: 'digest__icontains',
                        title: 'Digest',
                      },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
          <Pagination
            params={params}
            updateParams={p =>
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
            updateParams={p =>
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
          <table aria-label='Images' className='content-table pf-c-table'>
            <SortTable
              options={sortTableOptions}
              params={params}
              updateParams={p =>
                this.updateParams(p, () =>
                  this.queryImages(this.props.match.params['container']),
                )
              }
            />
            <tbody>
              {images.map((image, i) =>
                this.renderTableRow(image, i, canEditTags),
              )}
            </tbody>
          </table>
        )}
        <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
          <Pagination
            params={params}
            updateParams={p =>
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

  private renderTableRow(image: any, index: number, canEditTags: boolean) {
    const manifestLink = digestOrTag =>
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

    const url = window.location.href.split('://')[1].split('/ui')[0];
    let instruction =
      image.tags.length === 0
        ? image.digest
        : this.props.match.params['container'] + ':' + image.tags[0];
    const dropdownItems = [
      <DropdownItem
        key='edit-tags'
        onClick={() => {
          this.setState({ manageTagsManifestDigest: image.digest });
        }}
      >
        Edit tags
      </DropdownItem>,
    ];

    return (
      <tr key={index}>
        <td>
          <LabelGroup className={'tags-column'}>
            {image.tags.sort().map(tag => (
              <TagLink key={tag} tag={tag} />
            ))}
          </LabelGroup>
        </td>
        <td>
          <DateComponent date={image.pulp_created} />
        </td>
        <td>{image.layers}</td>
        <td>{getHumanSize(image.size)}</td>
        <td>
          <ShaLink digest={image.digest} />
        </td>
        <td>
          <ClipboardCopy isReadOnly>
            {'podman pull ' + url + '/' + instruction}
          </ClipboardCopy>
        </td>

        <td>
          {canEditTags && (
            <StatefulDropdown items={dropdownItems}></StatefulDropdown>
          )}
        </td>
      </tr>
    );
  }

  queryImages(name) {
    this.setState({ loading: true }, () =>
      ImagesAPI.list(
        name,
        ParamHelper.getReduced(this.state.params, this.nonQueryStringParams),
      )
        .then(result => {
          let images = [];
          result.data.data.forEach(object => {
            let image = pickBy(object, function(value, key) {
              return ['digest', 'tags', 'pulp_created'].includes(key);
            });
            image['layers'] = object.layers.length;
            let size = 0;
            object.layers.forEach(layer => (size += layer.size));
            image['size'] = size;
            images.push(image);
          });
          this.setState({
            images: images,
            numberOfImages: result.data.meta.count,
          });
        })
        .catch(error => this.setState({ redirect: 'notFound' })),
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}

export default withRouter(withContainerRepo(ExecutionEnvironmentDetailImages));
