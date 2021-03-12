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
  StatefulDropdown,
  Tabs,
  Tag,
  EmptyStateNoData,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import { ParamHelper } from '../../utilities';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ClipboardCopy,
  DropdownItem,
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
import { ImagesAPI, ActivitiesAPI } from '../../api';
import { pickBy } from 'lodash';
import * as moment from 'moment';
import './execution-environment-detail.scss';
import { TagIcon } from '@patternfly/react-icons';

interface IState {
  loading: boolean;
  container: any;
  images: any[];
  activities: any[];
  params: { id: string; tab: string; page?: number; page_size?: number };
  markdownEditing: boolean;
}

class ExecutionEnvironmentDetail extends React.Component<
  RouteComponentProps,
  IState
> {
  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    if (!params['page_size']) {
      params['page_size'] = 10;
    }

    if (!params['tab']) {
      params['tab'] = 'detail';
    }

    this.state = {
      loading: true,
      images: [],
      activities: [],
      container: { name: this.props.match.params['container'], readme: '' },
      params: {
        id: this.props.match.params['container'],
        tab: params['tab'],
        page: 1,
        page_size: 1,
      },
      markdownEditing: false,
    };
  }

  componentDidMount() {
    this.queryImages(this.state.container.name);
    this.queryActivities(this.state.container.name);
    this.setState({ loading: false });
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
      './compose down -v\n' +
      './compose up -d postgres redis\n' +
      './compose run --rm api manage migrate\n' +
      './compose run --rm -e PULP_FIXTURE_DIRS=\'["/src/galaxy_ng/dev/automation-hub"]\' api manage loaddata initial_data.json\n' +
      './compose down';

    return (
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Section className='body card-area'>
            {' '}
            <Title headingLevel='h2' size='lg'>
              Instructions
            </Title>
            <ClipboardCopy isCode isReadOnly variant={'expansion'}>
              {instructions}
            </ClipboardCopy>
          </Section>
        </FlexItem>
        <FlexItem>
          <Section className='body pf-c-content'>
            <Title headingLevel='h2' size='lg'>
              README
              {!this.state.markdownEditing && this.state.container.readme && (
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
            {!this.state.markdownEditing && !this.state.container.readme ? (
              <EmptyStateNoData
                title={'No README'}
                description={'Add README file by using RAW MAkdown editor'}
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
                text={this.state.container.readme}
                placeholder={
                  this.state.markdownEditing ? 'Here goes README' : ''
                }
                helperText={''}
                updateText={value =>
                  this.setState({
                    container: {
                      name: this.state.container.name,
                      readme: value,
                    },
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
                    this.setState({
                      markdownEditing: false,
                      container: {
                        name: this.state.container.name,
                        readme:
                          '## Table of Contents\n' +
                          '1. [General Info](#general-info)\n' +
                          '2. [Technologies](#technologies)\n' +
                          '3. [Installation](#installation)\n' +
                          '4. [Collaboration](#collaboration)\n' +
                          '5. [FAQs](#faqs)\n' +
                          '### General Info\n' +
                          '***\n' +
                          'Write down general information about your project. It is a good idea to always put a project status in the readme file. This is where you can add it. \n' +
                          '### Screenshot\n' +
                          '![Image text](https://www.united-internet.de/fileadmin/user_upload/Brands/Downloads/Logo_IONOS_by.jpg)\n' +
                          '## Technologies\n' +
                          '***\n' +
                          'A list of technologies used within the project:\n' +
                          '* [Technology name](https://example.com): Version 12.3 \n' +
                          '* [Technology name](https://example.com): Version 2.34\n' +
                          '* [Library name](https://example.com): Version 1234\n' +
                          '## Installation\n' +
                          '***\n' +
                          'A little intro about the installation. \n' +
                          '```\n' +
                          '$ git clone https://example.com\n' +
                          '$ cd ../path/to/the/file\n' +
                          '$ npm install\n' +
                          '$ npm start\n' +
                          '```\n' +
                          'Side information: To use the application in a special environment use ```lorem ipsum``` to start\n' +
                          '## Collaboration\n' +
                          '***\n' +
                          'Give instructions on how to collaborate with your project.\n' +
                          '> Maybe you want to write a quote in this part. \n' +
                          '> Should it encompass several lines?\n' +
                          '> This is how you do it.\n' +
                          '## FAQs\n' +
                          '***' +
                          'A list of frequently asked questions\n' +
                          '1. **This is a question in bold**\n' +
                          'Answer to the first question with _italic words_. \n' +
                          '2. __Second question in bold__ \n' +
                          'To answer this question, we use an unordered list:\n' +
                          '* First point\n' +
                          '* Second Point\n' +
                          '* Third point\n' +
                          '3. **Third question in bold**\n' +
                          'Answer to the third question with *italic words*.\n' +
                          '4. **Fourth question in bold**\n' +
                          '| Headline 1 in the tablehead | Headline 2 in the tablehead | Headline 3 in the tablehead |\n' +
                          '|:--------------|:-------------:|--------------:|\n' +
                          '| text-align left | text-align center | text-align right |',
                      },
                    })
                  }
                >
                  Save
                </Button>
                <Button
                  variant={'link'}
                  onClick={() =>
                    this.setState({
                      markdownEditing: false,
                      container: {
                        name: this.state.container.name,
                        readme: '',
                      },
                    })
                  }
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
    if (images.length === 0) {
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
          title: 'Image',
          type: 'none',
          id: 'image',
        },
        {
          title: '',
          type: 'none',
          id: 'instructions',
        },
        {
          title: '',
          type: 'none',
          id: 'kebab',
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
            count={this.state.images.length}
            isTop
          />
        </div>
        <div>
          <AppliedFilters
            updateParams={() => console.log('update params and queryImages')}
            params={params}
            ignoredParams={['page_size', 'page', 'sort', 'id', 'tab']}
          />
        </div>
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
        <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
          <Pagination
            params={params}
            updateParams={p =>
              this.updateParams(p, () =>
                this.queryImages(this.state.container.name),
              )
            }
            count={this.state.images.length}
          />
        </div>
      </Section>
    );
  }

  private renderTableRow(image: any, index: number) {
    return (
      <tr key={index}>
        <td>
          {image.tags.map(tag => (
            <Label variant='outline' icon={<TagIcon />}>
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
            <Label color='blue'>{image.digest.slice(0, 8)}</Label>
          </Popover>
        </td>
        <td>
          <ClipboardCopy isCode isReadOnly variant={'expansion'}>
            Here goes instructions.{' '}
          </ClipboardCopy>
        </td>
        <td>
          <StatefulDropdown
            items={[
              <DropdownItem
                key='download'
                onClick={() => console.log('Download manifest')}
              >
                Download manifest
              </DropdownItem>,
              <DropdownItem
                key='manage'
                onClick={() => console.log('Manage tags')}
              >
                Manage tags
              </DropdownItem>,
            ]}
          ></StatefulDropdown>{' '}
        </td>
      </tr>
    );
  }

  queryImages(name) {
    this.setState({ loading: true }, () =>
      ImagesAPI.list(name).then(result => {
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
          loading: false,
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
                      <Label color='blue'>{action.manifest_digest}</Label> from
                      <Label color='blue'>{removed.manifest_digest}</Label>
                    </React.Fragment>
                  );
                } else {
                  activityDescription = (
                    <React.Fragment>
                      <Label variant='outline' icon={<TagIcon />}>
                        {action.tag_name}
                      </Label>{' '}
                      was added to{' '}
                      <Label color='blue'>{action.manifest_digest}</Label>
                    </React.Fragment>
                  );
                }
              } else {
                activityDescription = (
                  <React.Fragment>
                    <Label color='blue'>{action.manifest_digest}</Label> was
                    added
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
                      <Label color='blue'>{action.manifest_digest}</Label>
                    </React.Fragment>
                  );
                } else {
                  // skip one added as moved
                  return;
                }
              } else {
                activityDescription = (
                  <React.Fragment>
                    <Label color='blue'>{action.manifest_digest}</Label> was
                    removed
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
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(ExecutionEnvironmentDetail);
