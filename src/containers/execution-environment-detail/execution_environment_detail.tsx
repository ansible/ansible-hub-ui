import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  AppliedFilters,
  BaseHeader,
  Breadcrumbs,
  CompoundFilter,
  Main,
  MarkdownEditor,
  Pagination,
  SortTable,
  Tabs,
  Tag,
  EmptyStateNoData,
  EmptyStateFilter,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import { filterIsSet, ParamHelper, truncateSha } from '../../utilities';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ClipboardCopy,
  FlexItem,
  Flex,
  Title,
  Popover,
  PopoverPosition,
  Button,
  Tooltip,
  Label,
} from '@patternfly/react-core';
import { Paths } from '../../paths';
import { ImagesAPI, ActivitiesAPI, ExecutionEnvironmentAPI } from '../../api';
import { pickBy } from 'lodash';
import * as moment from 'moment';
import './execution-environment-detail.scss';
import { TagIcon } from '@patternfly/react-icons';

interface IState {
  loading: boolean;
  container: { name: string };
  readme: string;
  images: any[];
  numberOfImages: number;
  activities: any[];
  params: { tab: string; page?: number; page_size?: number };
  markdownEditing: boolean;
}

class ExecutionEnvironmentDetail extends React.Component<
  RouteComponentProps,
  IState
> {
  nonQueryStringParams = ['tab'];

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

    if (!params['tab']) {
      params['tab'] = 'detail';
    }

    this.state = {
      loading: true,
      images: [],
      numberOfImages: 0,
      activities: [],
      container: { name: this.props.match.params['container'] },
      readme: '',
      params: {
        tab: params['tab'],
        page: params['page'],
        page_size: params['page_size'],
      },
      markdownEditing: false,
    };
  }

  componentDidMount() {
    const { container } = this.state;
    const all = [];
    all.push(this.queryReadme(container.name));
    all.push(this.queryActivities(container.name));
    all.push(this.queryImages(this.state.container.name));
    Promise.all(all).then(() => this.setState({ loading: false }));
  }

  render() {
    const { params } = this.state;
    const tabs = ['Detail', 'Activity', 'Images'];
    const description = '';
    return (
      <React.Fragment>
        <BaseHeader
          title={this.state.container.name}
          breadcrumbs={
            <Breadcrumbs
              links={[
                {
                  url: Paths.executionEnvironments,
                  name: 'Container Registry',
                },
                { name: this.state.container.name },
              ]}
            />
          }
        >
          <Tooltip content={description}>
            <p className={'truncated'}>{description}</p>
          </Tooltip>
          <span />
          <div className='tab-link-container'>
            <div className='tabs'>
              <Tabs
                tabs={tabs}
                params={params}
                updateParams={p => this.updateParams(p)}
              />
            </div>
          </div>
        </BaseHeader>
        <Main>
          {params['tab'] === 'detail' && this.renderDetail()}
          {params['tab'] === 'activity' && this.renderActivity()}
          {params['tab'] === 'images' && this.renderImages()}
        </Main>
      </React.Fragment>
    );
  }

  renderDetail() {
    const instructions =
      'podman pull localhost:5001/' + this.state.container.name + ':latest';

    return (
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Section className='body card-area'>
            {' '}
            <Title headingLevel='h2' size='lg'>
              Pull this image
            </Title>
            <ClipboardCopy isReadOnly>{instructions}</ClipboardCopy>
          </Section>
        </FlexItem>
        <FlexItem>
          <Section className='body pf-c-content'>
            <Title headingLevel='h2' size='lg'>
              {!this.state.markdownEditing && this.state.readme && (
                <Button
                  className={'edit-button'}
                  variant={'primary'}
                  onClick={() => {
                    this.setState({ markdownEditing: true });
                  }}
                >
                  Edit
                </Button>
              )}
            </Title>
            {!this.state.markdownEditing && !this.state.readme ? (
              <EmptyStateNoData
                title={'No README'}
                description={
                  'Add a README with instructions for using this container.'
                }
                button={
                  <Button
                    variant='primary'
                    onClick={() => this.setState({ markdownEditing: true })}
                  >
                    Add
                  </Button>
                }
              />
            ) : (
              <MarkdownEditor
                text={this.state.readme}
                placeholder={''}
                helperText={''}
                updateText={value =>
                  this.setState({
                    readme: value,
                  })
                }
                editing={this.state.markdownEditing}
              />
            )}

            {this.state.markdownEditing && (
              <React.Fragment>
                <Button
                  variant={'primary'}
                  onClick={() =>
                    this.saveReadme(
                      this.state.container.name,
                      this.state.readme,
                    )
                  }
                >
                  Save
                </Button>
                <Button
                  variant={'link'}
                  onClick={() => {
                    this.setState({
                      markdownEditing: false,
                    });
                    this.queryReadme(this.state.container.name);
                  }}
                >
                  Cancel
                </Button>
              </React.Fragment>
            )}
          </Section>
        </FlexItem>
      </Flex>
    );
  }

  renderActivity() {
    const { params, activities } = this.state;
    if (activities.length === 0) {
      return (
        <EmptyStateNoData
          title={'No activities yet'}
          description={'Activities will appear once you push something'}
        />
      );
    }
    return (
      <Flex>
        <Flex direction={{ default: 'column' }} flex={{ default: 'flex_1' }}>
          <FlexItem>
            <Section className='body'>
              <table aria-label='Activities' className='pf-c-table'>
                <SortTable
                  options={{
                    headers: [
                      { title: 'Change', type: 'none', id: 'change' },
                      { title: 'Date', type: 'none', id: 'date' },
                    ],
                  }}
                  params={params}
                  updateParams={() => {}}
                />
                <tbody>
                  {activities.map((action, i) => {
                    return (
                      <tr key={i}>
                        <th>{action.action}</th>
                        <Tooltip
                          content={moment(action.created).format(
                            'MMMM Do YYYY',
                          )}
                        >
                          <th>{moment(action.created).fromNow()}</th>
                        </Tooltip>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Section>
          </FlexItem>
        </Flex>
      </Flex>
    );
  }

  renderImages() {
    const { params, images } = this.state;
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
      ],
    };

    return (
      <Section className='body'>
        <div className='toolbar'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <CompoundFilter
                    updateParams={p =>
                      this.updateParams(p, () =>
                        this.queryImages(this.state.container.name),
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
                this.queryImages(this.state.container.name),
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
                this.queryImages(this.state.container.name),
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
                  this.queryImages(this.state.container.name),
                )
              }
            />
            <tbody>
              {images.map((image, i) => this.renderTableRow(image, i))}
            </tbody>
          </table>
        )}
        <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
          <Pagination
            params={params}
            updateParams={p =>
              this.updateParams(p, () =>
                this.queryImages(this.state.container.name),
              )
            }
            count={this.state.numberOfImages}
          />
        </div>
      </Section>
    );
  }

  private renderTableRow(image: any, index: number) {
    let instruction =
      image.tags.length === 0
        ? image.digest
        : this.state.container.name + ':' + image.tags[0];
    return (
      <tr key={index}>
        <td>
          {image.tags.map(tag => (
            <Label variant='outline' key={tag} icon={<TagIcon />}>
              {tag}
            </Label>
          ))}
        </td>
        <Tooltip content={moment(image.pulp_created).format('MMMM Do YYYY')}>
          <td>{moment(image.pulp_created).fromNow()}</td>
        </Tooltip>
        <td>{image.layers}</td>
        <td>{image.size}</td>
        <td>
          <Popover position={PopoverPosition.top} bodyContent={image.digest}>
            <Label color='blue'>{truncateSha(image.digest)}</Label>
          </Popover>
        </td>
        <td>
          <ClipboardCopy isReadOnly>
            {'podman pull localhost:5001/' + instruction}
          </ClipboardCopy>
        </td>
      </tr>
    );
  }

  queryReadme(name) {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.readme(name).then(result => {
        this.setState({
          readme: result.data.text,
        });
      }),
    );
  }

  saveReadme(name, readme) {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.saveReadme(name, { text: readme }).then(() => {
        this.setState({
          markdownEditing: false,
          loading: false,
        });
      }),
    );
  }

  queryImages(name) {
    this.setState({ loading: true }, () =>
      ImagesAPI.list(
        name,
        ParamHelper.getReduced(this.state.params, this.nonQueryStringParams),
      ).then(result => {
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
      }),
    );
  }

  queryActivities(name) {
    this.setState({ loading: true }, () => {
      ActivitiesAPI.list(name).then(result => {
        let activities = [];
        result.data.data.forEach(activity => {
          {
            activity.added.forEach(action => {
              let activityDescription;
              if (action.pulp_type === 'container.tag') {
                let removed = activity.removed.find(item => {
                  return item.tag_name === action.tag_name;
                });
                if (!!removed) {
                  activityDescription = (
                    <React.Fragment>
                      <Label variant='outline' icon={<TagIcon />}>
                        {action.tag_name}
                      </Label>{' '}
                      was moved to{' '}
                      <Label color='blue'>
                        {truncateSha(action.manifest_digest)}
                      </Label>{' '}
                      from
                      <Label color='blue'>
                        {truncateSha(removed.manifest_digest)}
                      </Label>
                    </React.Fragment>
                  );
                } else {
                  activityDescription = (
                    <React.Fragment>
                      <Label variant='outline' icon={<TagIcon />}>
                        {action.tag_name}
                      </Label>{' '}
                      was added to{' '}
                      <Label color='blue'>
                        {truncateSha(action.manifest_digest)}
                      </Label>
                    </React.Fragment>
                  );
                }
              } else {
                activityDescription = (
                  <React.Fragment>
                    <Label color='blue'>
                      {truncateSha(action.manifest_digest)}
                    </Label>{' '}
                    was added
                  </React.Fragment>
                );
              }
              activities.push({
                created: activity.pulp_created,
                action: activityDescription,
              });
            });
            activity.removed.forEach(action => {
              let activityDescription;
              if (action.pulp_type === 'container.tag') {
                if (
                  !activity.added.find(item => {
                    return item.tag_name === action.tag_name;
                  })
                ) {
                  activityDescription = (
                    <React.Fragment>
                      <Label variant='outline' icon={<TagIcon />}>
                        {action.tag_name}
                      </Label>{' '}
                      was removed from{' '}
                      <Label color='blue'>
                        {truncateSha(action.manifest_digest)}
                      </Label>
                    </React.Fragment>
                  );
                } else {
                  // skip one added as moved
                  return;
                }
              } else {
                activityDescription = (
                  <React.Fragment>
                    <Label color='blue'>
                      {truncateSha(action.manifest_digest)}
                    </Label>{' '}
                    was removed
                  </React.Fragment>
                );
              }
              activities.push({
                created: activity.pulp_created,
                action: activityDescription,
              });
            });
          }
        });
        let lastActivity = activities[activities.length - 1];
        if (!!lastActivity) {
          activities.push({
            created: lastActivity.created,
            action: (
              <React.Fragment>
                {this.state.container.name} was added
              </React.Fragment>
            ),
          });
        }
        this.setState({ activities: activities });
      });
    });
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin(this.nonQueryStringParams);
  }
}

export default withRouter(ExecutionEnvironmentDetail);
