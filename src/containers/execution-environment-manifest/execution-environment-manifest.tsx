import * as React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {
  BaseHeader,
  Breadcrumbs,
  Main,
  ShaLabel,
  TagLabel,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  ClipboardCopy,
  Flex,
  FlexItem,
  LabelGroup,
  Title,
} from '@patternfly/react-core';
import { Paths, formatPath } from '../../paths';
import { ImagesAPI, ActivitiesAPI, ExecutionEnvironmentAPI } from '../../api'; // TODO
import './execution-environment-manifest.scss';

interface IState {
  container: { name: string };
  digest: string;
  labels: string[];
  layers: any[]; // FIXME
  loading: boolean;
}

class ExecutionEnvironmentManifest extends React.Component<
  RouteComponentProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      container: { name: this.props.match.params['container'] },
      digest: this.props.match.params['digest'],
      labels: [],
      layers: [],
      loading: true,
    };
  }

  componentDidMount() {
    const { container, digest } = this.state;
    const whileLoading = callback =>
      this.setState({ loading: true }, () =>
        callback().then(data => this.setState({ loading: false, ...data })),
      );

    whileLoading(() =>
      this.query({
        container,
        digest,
      }),
    );
  }

  render() {
    const { container, digest, labels, layers, loading } = this.state;
    return (
      <>
        <BaseHeader
          title={'Image layers'}
          breadcrumbs={
            <Breadcrumbs
              links={[
                {
                  name: 'Container Registry',
                  url: Paths.executionEnvironments,
                },
                {
                  name: this.state.container.name,
                  url: formatPath(Paths.executionEnvironmentDetail, {
                    container: container.name,
                  }),
                },
                {
                  name: digest,
                },
              ]}
            />
          }
        >
          <div>
            <ShaLabel digest={digest} />
            {/* FIXME: better way? */}
            <ClipboardCopy
              isReadOnly
              className='clipboard-hide-input clipboard-inline'
            >
              {digest}
            </ClipboardCopy>
          </div>

          <LabelGroup>
            {labels.map(label => (
              <TagLabel tag={label} key={label} />
            ))}
          </LabelGroup>
        </BaseHeader>

        <Main>
          <Flex direction={{ default: 'column' }}>
            <FlexItem>
              <Section className='body'>
                <Title headingLevel='h2' size='lg'>
                  Image layers
                </Title>
              </Section>
            </FlexItem>
          </Flex>
        </Main>
      </>
    );
  }

  query(name) {
    // FIXME
    return Promise.resolve({
      labels: ['focal', 'groovy', 'matcha'],
      layers: ['ADD file'],
    });
    ExecutionEnvironmentAPI.readme(name).then(result => ({
      labels: [],
      layers: [],
    }));
  }
}

export default withRouter(ExecutionEnvironmentManifest);
