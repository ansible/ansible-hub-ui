import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import {
  Button,
  ClipboardCopyButton,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  List,
  ListItem,
  Modal,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, TagIcon } from '@patternfly/react-icons';
import { ControllerAPI, ExecutionEnvironmentAPI } from 'src/api';
import {
  APISearchTypeAhead,
  AlertList,
  AlertType,
  AppliedFilters,
  CompoundFilter,
  EmptyStateFilter,
  EmptyStateNoData,
  LoadingPageSpinner,
  Pagination,
  ShaLabel,
  closeAlertMixin,
} from 'src/components';
import { filterIsSet, getContainersURL } from 'src/utilities';

interface IProps {
  image: string;
  digest?: string;
  isOpen: boolean;
  onClose: () => void;
  tag?: string;
}

interface IState {
  alerts: AlertType[];
  controllers: string[];
  controllerCount: number;
  controllerParams: {
    page: number;
    page_size: number;
    host__icontains?: string;
  };
  digest?: string;
  digestByTag: { [key: string]: string };
  loading: boolean;
  tag?: string;
  tagResults: { name: string; id: string }[];
  tagSelection: { name: string; id: string }[];
  tags: { tag: string; digest: string }[];
  inputText: string;
}

const initialState = {
  alerts: [],
  controllers: null,
  controllerCount: 0,
  controllerParams: { page: 1, page_size: 10 },
  digest: null,
  digestByTag: {},
  loading: true,
  tag: null,
  tagResults: [],
  tagSelection: [],
  tags: [],
  inputText: '',
};

export class PublishToControllerModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = initialState;
  }

  componentDidUpdate(prevProps) {
    const { image, isOpen } = this.props;

    if (isOpen !== prevProps.isOpen) {
      if (isOpen) {
        // load on open
        this.fetchData(image);
      } else {
        // reset on close
        this.setState(initialState);
      }
    }
  }

  fetchControllers() {
    const { controllerParams: params } = this.state;
    return ControllerAPI.list(params)
      .then(({ data }) => {
        const controllers = data.data.map((c) => c.host);
        const controllerCount = data.meta.count;

        this.setState({ controllers, controllerCount });

        return controllers;
      })
      .catch((e) =>
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error loading Controllers`,
              description: e.message,
            },
          ],
        }),
      );
  }

  fetchTags(image, name?) {
    // filter tags by digest when provided from Images list
    const { digest } = this.props;

    return ExecutionEnvironmentAPI.tags(image, {
      sort: '-pulp_created',
      ...(digest ? { tagged_manifest__digest: digest } : {}),
      ...(name ? { name__icontains: name } : {}),
    })
      .then(({ data }) => {
        const tags = data.data.map(
          ({ name: tag, tagged_manifest: { digest } }) => ({ digest, tag }),
        );

        const digestByTag = {};
        tags.forEach(({ digest, tag }) => (digestByTag[tag] = digest));

        const tagResults = tags.map(({ tag }) => ({ id: tag, name: tag }));

        this.setState({
          digestByTag,
          tagResults,
          tags,
        });

        return tags;
      })
      .catch((e) =>
        this.setState({
          alerts: [
            ...this.state.alerts,
            {
              variant: 'danger',
              title: t`Error loading tags`,
              description: e.message,
            },
          ],
        }),
      );
  }

  fetchData(image) {
    const controllers = this.fetchControllers();
    const tags = this.fetchTags(image).then(() => {
      // preselect tag if present
      let { digest, tag } = this.props;
      tag ||= this.state.tags[0]?.tag; // default to first tag unless in props (tags already filtered by digest if in props)
      digest ||= this.state.digestByTag[tag]; // set digest by tag unless in props

      this.setState({
        digest,
        tag,
        tagSelection: tag ? [{ id: tag, name: tag }] : [],
      });
    });

    Promise.all([controllers, tags]).then(() =>
      this.setState({ loading: false }),
    );
  }

  renderControllers() {
    const { image, isOpen } = this.props;
    const { controllers, controllerCount, digest, tag } = this.state;
    const url = getContainersURL();
    const unsafeLinksSupported = !Object.keys(window).includes('chrome');

    if (!isOpen || !controllers) {
      return null;
    }

    if (controllers.length === 0) {
      // EmptyStateNoData already handled in render()
      return <EmptyStateFilter />;
    }

    if (!digest && !tag) {
      return t`No tag or digest selected.`;
    }

    return (
      <List isPlain isBordered>
        {controllers.map((host) => {
          const imageUrl = `${url}/${tag ? `${image}:${tag}` : digest}`;
          const href = `${host}/#/execution_environments/add?image=${encodeURIComponent(
            imageUrl,
          )}`;

          return (
            <ListItem style={{ paddingTop: '8px' }}>
              <a href={href} target='_blank'>
                {host}
              </a>{' '}
              {unsafeLinksSupported && (
                <small>
                  <ExternalLinkAltIcon />
                </small>
              )}
              {!unsafeLinksSupported && (
                <ClipboardCopyButton
                  variant={'plain'}
                  children={t`Copy to clipboard`}
                  id={href}
                  textId={t`Copy to clipboard`}
                  onClick={() => navigator.clipboard.writeText(href)}
                />
              )}
            </ListItem>
          );
        })}
      </List>
    );
  }

  render() {
    const { image, isOpen, onClose } = this.props;
    const {
      alerts,
      controllers,
      controllerCount,
      controllerParams,
      loading,
      digest,
      digestByTag,
      tagResults,
      tagSelection,
    } = this.state;

    const docsLink =
      'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/2.1';

    const noData =
      controllers?.length === 0 &&
      !filterIsSet(controllerParams, ['host__icontains']);

    const notListedMessage = (
      <>
        {t`If the Controller is not listed in the table, check settings.py.`}{' '}
        {docsLink && (
          <>
            <a href={docsLink} target='_blank'>
              {t`Learn more`}
            </a>{' '}
            <ExternalLinkAltIcon />
          </>
        )}
      </>
    );

    const Spacer = () => <div style={{ paddingTop: '24px' }}></div>;
    const unsafeLinksSupported = !Object.keys(window).includes('chrome');

    return (
      <Modal
        variant='large'
        title={t`Use in Controller`}
        isOpen={isOpen}
        onClose={onClose}
        actions={[
          <Button key='close' variant='primary' onClick={onClose}>
            {t`Close`}
          </Button>,
        ]}
      >
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        {loading && (
          <div style={{ padding: '16px' }}>
            <LoadingPageSpinner />
          </div>
        )}
        {noData && !loading ? (
          <EmptyStateNoData
            title={t`No Controllers available`}
            description={notListedMessage}
          />
        ) : null}

        {isOpen && !loading && !noData && controllers && (
          <>
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {t`Execution Environment`}
                </DescriptionListTerm>
                <DescriptionListDescription>{image}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t`Tag`}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Flex>
                    <FlexItem>
                      <APISearchTypeAhead
                        loadResults={(name) => this.fetchTags(image, name)}
                        onClear={() =>
                          this.setState({ tag: null, tagSelection: [] })
                        }
                        onSelect={(event, value) => {
                          const digest = digestByTag[value.toString()];
                          this.setState({
                            tag: digest && value.toString(),
                            tagSelection: [{ id: value, name: value }],
                            digest,
                          });
                        }}
                        placeholderText={t`Select a tag`}
                        results={tagResults}
                        selections={tagSelection}
                        toggleIcon={<TagIcon />}
                      />
                    </FlexItem>
                    <FlexItem></FlexItem>
                  </Flex>
                </DescriptionListDescription>
              </DescriptionListGroup>
              {digest && (
                <>
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t`Digest`}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <ShaLabel grey long digest={digest} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                </>
              )}
            </DescriptionList>
            <Spacer />
            <Trans>
              Click on the Controller URL that you want to use the above
              execution environment in, and it will launch that Controller's
              console. Log in (if necessary) and follow the steps to complete
              the configuration.
            </Trans>
            <br />
            {!unsafeLinksSupported && (
              <Trans>
                <b>Note:</b> The following links may be blocked by your browser.
                Copy and paste the link manually.
              </Trans>
            )}
            <Spacer />

            <Flex>
              <FlexItem>
                <CompoundFilter
                  inputText={this.state.inputText}
                  onChange={(text) => this.setState({ inputText: text })}
                  updateParams={(controllerParams) => {
                    controllerParams.page = 1;
                    this.setState({ controllerParams }, () =>
                      this.fetchControllers(),
                    );
                  }}
                  params={controllerParams}
                  filterConfig={[
                    {
                      id: 'host__icontains',
                      title: t`Controller name`,
                    },
                  ]}
                />
              </FlexItem>
              <FlexItem grow={{ default: 'grow' }}></FlexItem>
              <FlexItem>
                <Pagination
                  params={controllerParams}
                  updateParams={(controllerParams) => {
                    this.setState({ controllerParams }, () =>
                      this.fetchControllers(),
                    );
                  }}
                  count={controllerCount}
                  isTop
                />
              </FlexItem>
            </Flex>

            <AppliedFilters
              updateParams={(controllerParams) =>
                this.setState({ controllerParams }, () =>
                  this.fetchControllers(),
                )
              }
              params={controllerParams}
              ignoredParams={['page_size', 'page']}
              niceNames={{
                host__icontains: t`Controller name`,
              }}
            />

            <Spacer />
            {this.renderControllers()}
            <Spacer />

            <Pagination
              params={controllerParams}
              updateParams={(controllerParams) => {
                this.setState({ controllerParams }, () =>
                  this.fetchControllers(),
                );
              }}
              count={controllerCount}
              isTop
            />
            <Spacer />
            <div>{notListedMessage}</div>
          </>
        )}
      </Modal>
    );
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }
}
