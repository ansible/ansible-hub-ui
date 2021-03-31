import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import {
  BaseHeader,
  Breadcrumbs,
  Main,
  MarkdownEditor,
  Tabs,
  EmptyStateNoData,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  ClipboardCopy,
  FlexItem,
  Flex,
  Title,
  Button,
  Tooltip,
} from '@patternfly/react-core';
import { formatPath, Paths } from '../../paths';
import { ExecutionEnvironmentAPI } from '../../api';
import './execution-environment-detail.scss';

interface IState {
  loading: boolean;
  container: { name: string };
  readme: string;
  markdownEditing: boolean;
  redirect: string;
}

class ExecutionEnvironmentDetail extends React.Component<
  RouteComponentProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      container: { name: this.props.match.params['container'] },
      readme: '',
      markdownEditing: false,
      redirect: null,
    };
  }

  componentDidMount() {
    const { container } = this.state;
    this.queryReadme(container.name);
  }

  render() {
    const tabs = ['Detail', 'Activity', 'Images'];
    const description = '';

    if (this.state.redirect === 'activity') {
      return (
        <Redirect
          to={formatPath(Paths.executionEnvironmentDetailActivities, {
            container: this.state.container.name,
          })}
        />
      );
    } else if (this.state.redirect === 'images') {
      return (
        <Redirect
          to={formatPath(Paths.executionEnvironmentDetailImages, {
            container: this.state.container.name,
          })}
        />
      );
    }
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
                params={{ tab: 'detail' }}
                updateParams={p => this.setState({ redirect: p.tab })}
              />
            </div>
          </div>
        </BaseHeader>
        <Main>{this.renderDetail()}</Main>
      </React.Fragment>
    );
  }

  renderDetail() {
    const url = window.location.href
      .split('://')[1]
      .split('/ui')[0]
      .replace('8002', '5001');
    const instructions =
      'podman pull ' + url + '/' + this.state.container.name + ':latest';

    return (
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Section className='body card-area'>
            {' '}
            <Title headingLevel='h2' size='lg'>
              Instructions
            </Title>
            <Title headingLevel='h3' size='md'>
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

  queryReadme(name) {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.readme(name).then(result => {
        this.setState({
          readme: result.data.text,
          loading: false,
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
}

export default withRouter(ExecutionEnvironmentDetail);
