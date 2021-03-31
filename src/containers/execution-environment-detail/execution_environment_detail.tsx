import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router-dom';
import {
  BaseHeader,
  Breadcrumbs,
  Main,
  MarkdownEditor,
  Tabs,
  EmptyStateNoData,
  ExecutionEnvironmentHeader,
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
      readme: '',
      markdownEditing: false,
      redirect: null,
    };
  }

  componentDidMount() {
    this.queryReadme(this.props.match.params['container']);
  }

  render() {
    if (this.state.redirect === 'activity') {
      return (
        <Redirect
          to={formatPath(Paths.executionEnvironmentDetailActivities, {
            container: this.props.match.params['container'],
          })}
        />
      );
    } else if (this.state.redirect === 'images') {
      return (
        <Redirect
          to={formatPath(Paths.executionEnvironmentDetailImages, {
            container: this.props.match.params['container'],
          })}
        />
      );
    }
    return (
      <React.Fragment>
        <ExecutionEnvironmentHeader
          id={this.props.match.params['container']}
          updateParams={p => this.setState({ redirect: p.tab })}
          tab='detail'
        />
        <Main>{this.renderDetail()}</Main>
      </React.Fragment>
    );
  }

  renderDetail() {
    const url = window.location.href.split('://')[1].split('/ui')[0];
    const instructions =
      'podman pull ' +
      url +
      '/' +
      this.props.match.params['container'] +
      ':latest';

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
                      this.props.match.params['container'],
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
                    this.queryReadme(this.props.match.params['container']);
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
