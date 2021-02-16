import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  AppliedFilters,
  BaseHeader,
  Breadcrumbs,
  CompoundFilter,
  Main,
  Pagination,
  SortTable,
  StatefulDropdown,
  Tabs,
  Tag,
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
} from '@patternfly/react-core';
import { Paths } from '../../paths';

interface IState {
  loading: boolean;
  container: any;
  images: any[];
  params: { id: string; tab: string; page?: number; page_size?: number };
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
      images: [
        {
          id: 'sha256:234567kjnbvgfdrfgyuihjbhvcftugyiuho1',
          tags: ['pepa', 'karel'],
          published: '1 day ago',
          layers: 1,
          size: 956,
        },
      ],
      container: { name: this.props.match.params['container'] },
      params: { id: 'pepa', tab: params['tab'], page: 1, page_size: 1 },
    };
  }

  componentDidMount() {
    this.setState({ loading: false });
  }

  render() {
    const { params } = this.state;
    const tabs = ['Detail', 'Activity', 'Images'];
    return (
      <React.Fragment>
        <BaseHeader
          title={this.state.container.name}
          breadcrumbs={
            <Breadcrumbs
              links={[
                { url: Paths.groupList, name: 'Groups' },
                { name: this.state.container.name },
              ]}
            />
          }
        >
          I am looong description
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
    return <Section className='body pf-c-content'> "DETAIL" </Section>;
  }

  renderActivity() {
    return (
      <React.Fragment>
        <Section className='body card-area'>Activity</Section>
        <Section className='body card-area'> REcent build </Section>{' '}
        <Section className='body card-area'> Instructions </Section>{' '}
      </React.Fragment>
    );
  }

  renderImages() {
    const { params, images } = this.state;
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
                      this.updateParams(p, () => this.queryImages())
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
            updateParams={p => this.updateParams(p, () => this.queryImages())}
            count={1}
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
            updateParams={p => this.updateParams(p, () => this.queryImages())}
          />
          <tbody>
            {images.map((image, i) => this.renderTableRow(image, i))}
          </tbody>
        </table>
        <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
          <Pagination
            params={params}
            updateParams={p => this.updateParams(p, () => this.queryImages())}
            count={1}
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
            <Tag key={tag}>{tag}</Tag>
          ))}
        </td>
        <td>{image.published}</td>
        <td>{image.layers}</td>
        <td>{image.size}</td>
        <td>{image.id}</td>
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

  queryImages() {
    console.log('QUERY IMAGES');
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }
}

export default withRouter(ExecutionEnvironmentDetail);
