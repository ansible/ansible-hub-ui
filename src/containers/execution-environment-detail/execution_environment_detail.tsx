import { t } from '@lingui/macro';
import {
  Button,
  Card,
  CardBody,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import {
  ExecutionEnvironmentAPI,
  type GroupObjectPermissionType,
} from 'src/api';
import {
  ClipboardCopy,
  EmptyStateNoData,
  MarkdownEditor,
} from 'src/components';
import { getContainersURL, withRouter } from 'src/utilities';
import {
  type IDetailSharedProps,
  withContainerParamFix,
  withContainerRepo,
} from './base';
import './execution-environment-detail.scss';

interface IState {
  loading: boolean;
  readme: string;
  markdownEditing: boolean;
  redirect: string;
  distribution_id: string;
  groups: GroupObjectPermissionType[];
  description: string;
}

class ExecutionEnvironmentDetail extends React.Component<
  IDetailSharedProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      readme: '',
      markdownEditing: false,
      redirect: null,
      distribution_id: '',
      groups: [],
      description: '',
    };
  }

  componentDidMount() {
    this.queryReadme(this.props.containerRepository.name);
  }

  render() {
    return this.renderDetail();
  }

  renderDetail() {
    const { containerRepository } = this.props;
    const canEdit = containerRepository.namespace.my_permissions.includes(
      'container.change_containernamespace',
    );

    const instructions =
      'podman pull ' +
      getContainersURL({
        name: containerRepository.name,
      });

    return (
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <section className='body card-area'>
            {' '}
            <Title headingLevel='h2' size='lg'>
              {t`Instructions`}
            </Title>
            <Title headingLevel='h3' size='md'>
              {t`Pull this image`}
            </Title>
            <ClipboardCopy isReadOnly>{instructions}</ClipboardCopy>
          </section>
        </FlexItem>
        <FlexItem>
          <section className='body pf-c-content'>
            <Card>
              <CardBody>
                <Title headingLevel='h2' size='lg'>
                  {!this.state.markdownEditing &&
                    this.state.readme &&
                    canEdit && (
                      <Button
                        className={'hub-c-button-edit'}
                        variant={'primary'}
                        onClick={() => {
                          this.setState({ markdownEditing: true });
                        }}
                      >
                        {t`Edit`}
                      </Button>
                    )}
                </Title>
                {!this.state.markdownEditing && !this.state.readme ? (
                  <EmptyStateNoData
                    title={t`No README`}
                    description={t`Add a README with instructions for using this container.`}
                    button={
                      canEdit ? (
                        <div data-cy='add-readme'>
                          <Button
                            variant='primary'
                            onClick={() =>
                              this.setState({ markdownEditing: true })
                            }
                          >
                            {t`Add`}
                          </Button>
                        </div>
                      ) : null
                    }
                  />
                ) : (
                  <MarkdownEditor
                    text={this.state.readme}
                    placeholder={''}
                    helperText={''}
                    updateText={(value) =>
                      this.setState({
                        readme: value,
                      })
                    }
                    editing={this.state.markdownEditing}
                  />
                )}

                {this.state.markdownEditing && (
                  <React.Fragment>
                    <div data-cy='save-readme'>
                      <Button
                        variant={'primary'}
                        onClick={() =>
                          this.saveReadme(
                            this.props.containerRepository.name,
                            this.state.readme,
                          )
                        }
                      >
                        {t`Save`}
                      </Button>
                    </div>
                    <Button
                      variant={'link'}
                      onClick={() => {
                        this.setState({
                          markdownEditing: false,
                        });
                        this.queryReadme(this.props.containerRepository.name);
                      }}
                    >
                      {t`Cancel`}
                    </Button>
                  </React.Fragment>
                )}
              </CardBody>
            </Card>
          </section>
        </FlexItem>
      </Flex>
    );
  }

  queryReadme(name) {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.readme(name)
        .then((result) => {
          this.setState({
            readme: result.data.text,
            loading: false,
          });
        })
        .catch(() => this.setState({ redirect: 'notFound' })),
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

export default withRouter(
  withContainerParamFix(withContainerRepo(ExecutionEnvironmentDetail)),
);
