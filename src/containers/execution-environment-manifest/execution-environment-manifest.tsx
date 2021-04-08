import * as React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {
  BaseHeader,
  Breadcrumbs,
  LoadingPageWithHeader,
  Main,
  ShaLabel,
  TagLabel,
} from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  ClipboardCopy,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  Flex,
  FlexItem,
  LabelGroup,
  Title,
} from '@patternfly/react-core';
import { sum } from 'lodash';
import { Paths, formatPath } from '../../paths';
import { ExecutionEnvironmentAPI } from '../../api';
import { getHumanSize } from 'src/utilities';
import './execution-environment-manifest.scss';

interface IState {
  container: { name: string };
  digest: string;
  environment: string[];
  labels: string[];
  layers: { text: string; size: string }[];
  loading: boolean;
  size: number;
}

class ExecutionEnvironmentManifest extends React.Component<
  RouteComponentProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      container: { name: this.props.match.params['container'] },
      digest: this.props.match.params['digest'], // digest or tag until loading done
      environment: [],
      labels: [],
      layers: [],
      loading: true,
      size: 0,
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
    const {
      container,
      digest,
      environment,
      labels,
      layers,
      loading,
      size,
    } = this.state;

    if (loading) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

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
            {/* custom class hides the associated input and inlines the button after the label */}
            <ClipboardCopy
              isReadOnly
              className='clipboard-hide-input clipboard-inline'
            >
              {digest}
            </ClipboardCopy>
          </div>

          <LabelGroup numLabels={6}>
            {labels.map(label => (
              <TagLabel tag={label} key={label} />
            ))}
          </LabelGroup>

          <div>Size: {size}</div>
        </BaseHeader>

        <Main>
          <Flex direction={{ default: 'column' }}>
            <FlexItem>
              <Section className='body'>
                <Title headingLevel='h2' size='lg'>
                  Image layers
                </Title>

                <DataList aria-label='Image layers'>
                  {layers.map(({ text, size }, index) => (
                    <DataListItem key={index}>
                      <DataListItemRow>
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key='primary content'>
                              <code>{text}</code>
                            </DataListCell>,
                            size && (
                              <DataListCell key='secondary content'>
                                {size}
                              </DataListCell>
                            ),
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  ))}
                </DataList>
              </Section>
            </FlexItem>

            <FlexItem>
              <Section className='body'>
                <Title headingLevel='h2' size='lg'>
                  Environment
                </Title>

                {environment.map((line, index) => (
                  <>
                    <code key={index}>{line}</code>
                    <br />
                  </>
                ))}
              </Section>
            </FlexItem>
          </Flex>
        </Main>
      </>
    );
  }

  query({ container, digest: digestOrTag }) {
    return ExecutionEnvironmentAPI.image(container.name, digestOrTag).then(
      ({ data: { config_blob, digest, layers, tags } }) => {
        const sizes = layers.map(l => l.size);
        const size = getHumanSize(sum(sizes));

        // convert '/bin/sh -c #(nop)  CMD ["sh"]' to 'CMD ["sh"]'
        // but keep anything without #(nop) unchanged
        const parseNop = str => str.replace(/^.*#\(nop\)\s+(.*)/, '$1');

        const history = config_blob.data.history.map(({ created_by }) => ({
          text: parseNop(created_by),
          // FIXME: size, but no correspondence between the order of history (which have the commands) and layers (which have sizes)
        }));

        return {
          digest,
          environment: config_blob.data.config.Env || [],
          labels: tags || [],
          layers: history,
          size,
        };
      },
    );
  }
}

export default withRouter(ExecutionEnvironmentManifest);
