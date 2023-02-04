import { Trans, t } from '@lingui/macro';
import {
  Card,
  CardBody,
  CardTitle,
  ClipboardCopyButton,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  LabelGroup,
  Title,
} from '@patternfly/react-core';
import { sum } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ExecutionEnvironmentAPI } from 'src/api';
import {
  BaseHeader,
  Breadcrumbs,
  LoadingPageWithHeader,
  Main,
  ShaLabel,
  TagLabel,
} from 'src/components';
import { Paths, formatEEPath, formatPath } from 'src/paths';
import {
  RouteProps,
  chipGroupProps,
  getHumanSize,
  withRouter,
} from 'src/utilities';
import { withContainerParamFix } from '../execution-environment-detail/base';
import './execution-environment-manifest.scss';

interface IState {
  container: { name: string };
  digest: string;
  environment: string[];
  error: boolean;
  labels: string[];
  layers: { text: string; size: string }[];
  loading: boolean;
  selectedLayer: string;
  size: number;
}

class ExecutionEnvironmentManifest extends React.Component<RouteProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      container: { name: this.props.routeParams.container },
      digest: this.props.routeParams.digest, // digest or tag until loading done
      environment: [],
      error: false,
      labels: [],
      layers: [],
      loading: true,
      selectedLayer: 'layer-0',
      size: 0,
    };
  }

  componentDidMount() {
    const { container, digest } = this.state;
    const whileLoading = (callback) =>
      this.setState({ loading: true }, () =>
        callback().then((data) => this.setState({ loading: false, ...data })),
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
      error,
      labels,
      layers,
      loading,
      selectedLayer,
      size,
    } = this.state;

    if (loading) {
      return <LoadingPageWithHeader></LoadingPageWithHeader>;
    }

    const command = (layers[selectedLayer.split(/-/)[1]] || {}).text;

    return (
      <>
        <BaseHeader
          title={t`Image layers`}
          breadcrumbs={
            <Breadcrumbs
              links={[
                {
                  name: t`Execution Environments`,
                  url: formatPath(Paths.executionEnvironments),
                },
                {
                  name: this.state.container.name,
                  url: formatEEPath(Paths.executionEnvironmentDetail, {
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
          <div className='copy-sha'>
            <ShaLabel digest={digest} long={true} />
            <ClipboardCopyButton
              className='eco-clipboard-copy'
              variant={'plain'}
              onClick={() => navigator.clipboard.writeText(digest)}
              id={digest}
              textId={t`Copy to clipboard`}
            >
              {digest}
            </ClipboardCopyButton>
          </div>

          <LabelGroup {...chipGroupProps()} numLabels={6}>
            {labels.map((label) => (
              <TagLabel tag={label} key={label} />
            ))}
          </LabelGroup>

          <div style={{ padding: '4px 0' }}>
            <Trans>Size: {size}</Trans>
          </div>
        </BaseHeader>

        <Main>
          {error ? (
            <Trans>
              Manifest lists are not currently supported on this screen, please
              use the{' '}
              <Link
                to={formatEEPath(Paths.executionEnvironmentDetailImages, {
                  container: container.name,
                })}
              >
                Images
              </Link>{' '}
              tab to see manifest list details.
            </Trans>
          ) : (
            <Flex>
              <FlexItem className='layers-max-width'>
                <Card>
                  <CardTitle>
                    <Title headingLevel='h2' size='lg'>
                      {t`Image layers`}
                    </Title>
                  </CardTitle>
                  <CardBody>
                    <DataList
                      aria-label={t`Image layers`}
                      onSelectDataListItem={(id) =>
                        this.setState({ selectedLayer: id })
                      }
                      selectedDataListItemId={selectedLayer}
                    >
                      {layers.map(({ text, size }, index) => (
                        <DataListItem key={index} id={`layer-${index}`}>
                          <DataListItemRow>
                            <DataListItemCells
                              dataListCells={[
                                <DataListCell
                                  key='primary content'
                                  className='single-line-ellipsis'
                                >
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
                  </CardBody>
                </Card>
              </FlexItem>

              <Flex
                direction={{ default: 'column' }}
                className='layers-max-width'
              >
                <FlexItem>
                  <Card>
                    <CardTitle>
                      <Title headingLevel='h2' size='lg'>
                        {t`Command`}
                      </Title>
                    </CardTitle>
                    <CardBody>
                      <code>{command}</code>
                    </CardBody>
                  </Card>
                </FlexItem>
                <FlexItem>
                  <Card>
                    <CardTitle>
                      <Title headingLevel='h2' size='lg'>
                        {t`Environment`}
                      </Title>
                    </CardTitle>
                    <CardBody>
                      {environment.map((line, index) => (
                        <React.Fragment key={index}>
                          <code>{line}</code>
                          <br />
                        </React.Fragment>
                      ))}
                    </CardBody>
                  </Card>
                </FlexItem>
              </Flex>
            </Flex>
          )}
        </Main>
      </>
    );
  }

  query({ container, digest: digestOrTag }) {
    return ExecutionEnvironmentAPI.image(container.name, digestOrTag)
      .then(({ data: { config_blob, digest, layers, tags } }) => {
        const sizes = layers.map((l) => l.size);
        const size = getHumanSize(sum(sizes));

        // convert '/bin/sh -c #(nop)  CMD ["sh"]' to 'CMD ["sh"]'
        // but keep anything without #(nop) unchanged
        const parseNop = (str) => str.replace(/^.*#\(nop\)\s+(.*)/, '$1');

        // Filter out layers that don't have a "created_by" field.
        const history = config_blob.data.history
          .filter((item) => 'created_by' in item)
          .map(({ created_by }) => ({
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
      })
      .catch(() => {
        // FIXME: support manifest lists, and have API support it
        return {
          error: true,
        };
      });
  }
}

export default withRouter(withContainerParamFix(ExecutionEnvironmentManifest));
