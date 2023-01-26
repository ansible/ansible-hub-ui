import { Trans, t } from '@lingui/macro';
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
import React, { useEffect, useState } from 'react';
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
import { errorMessage, filterIsSet, getContainersURL } from 'src/utilities';

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
  digestState?: string;
  digestByTag: { [key: string]: string };
  loading: boolean;
  tagState?: string;
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
  digestState: null,
  digestByTag: {},
  loading: true,
  tagState: null,
  tagResults: [],
  tagSelection: [],
  tags: [],
  inputText: '',
};

export const PublishToControllerModal = (props: IProps) => {
  const [alerts, setAlerts] = useState(initialState.alerts);
  const [controllers, setControllers] = useState(initialState.controllers);
  const [controllerCount, setControllerCount] = useState(
    initialState.controllerCount,
  );
  const [controllerParams, setControllerParams] = useState(
    initialState.controllerParams,
  );
  const [digestState, setDigestState] = useState(initialState.digestState);
  const [digestByTag, setDigestByTag] = useState(initialState.digestByTag);
  const [loading, setLoading] = useState(initialState.loading);
  const [tagState, setTagState] = useState(initialState.tagState);
  const [tagResults, setTagResults] = useState(initialState.tagResults);
  const [tagSelection, setTagSelection] = useState(initialState.tagSelection);
  const [tags, setTags] = useState(initialState.tags);
  const [inputText, setInputText] = useState(initialState.inputText);

  useEffect(() => {
    if (props.isOpen) {
      // load on open
      fetchData(props.image);
    } else {
      // reset on close
      setAlerts(initialState.alerts);
      setControllers(initialState.controllers);
      setControllerCount(initialState.controllerCount);
      setControllerParams(initialState.controllerParams);
      setDigestState(initialState.digestState);
      setDigestByTag(initialState.digestByTag);
      setLoading(initialState.loading);
      setTagState(initialState.tagState);
      setTagResults(initialState.tagResults);
      setTagSelection(initialState.tagSelection);
      setTags(initialState.tags);
      setInputText(initialState.inputText);
    }
  }, [props.isOpen]);

  useEffect(() => {
    fetchControllers();
  }, [controllerParams]);

  const fetchControllers = () => {
    return ControllerAPI.list(controllerParams)
      .then(({ data }) => {
        const controllers = data.data.map((c) => c.host);
        const controllerCount = data.meta.count;

        //this.setState({ controllers, controllerCount });
        setControllers(controllers);
        setControllerCount(controllerCount);

        return controllers;
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        setAlerts([
          ...alerts,
          {
            variant: 'danger',
            title: t`Controllers list could not be displayed.`,
            description: errorMessage(status, statusText),
          },
        ]);
      });
  };

  const fetchTags = (image, name?) => {
    // filter tags by digest when provided from Images list
    const { digest } = props;

    return ExecutionEnvironmentAPI.tags(image, {
      sort: '-created_at',
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

        setDigestByTag(digestByTag);
        setTagResults(tagResults);
        setTags(tags);

        return tags;
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        setAlerts([
          ...alerts,
          {
            variant: 'danger',
            title: t`Controllers list could not be displayed.`,
            description: errorMessage(status, statusText),
          },
        ]);
      });
  };

  const fetchData = (image) => {
    const controllers = fetchControllers();
    const tags = fetchTags(image).then(() => {
      // preselect tag if present
      let tag = props.tag;
      let digest = props.digest;
      tag ||= tags[0]?.tag; // default to first tag unless in props (tags already filtered by digest if in props)
      digest ||= digestByTag[tag]; // set digest by tag unless in props
      setDigestState(digest);
      setTagState(tag);
      setTagSelection(tag ? [{ id: tag, name: tag }] : []);
    });

    Promise.all([controllers, tags]).then(() => setLoading(false));
  };

  const renderControllers = () => {
    const { image, isOpen } = props;
    const unsafeLinksSupported = !Object.keys(window).includes('chrome');

    if (!isOpen || !controllers) {
      return null;
    }

    if (controllers.length === 0) {
      // EmptyStateNoData already handled in render()
      return <EmptyStateFilter />;
    }

    if (!digestState && !tagState) {
      return t`No tag or digest selected.`;
    }

    const imageUrl = encodeURIComponent(
      getContainersURL({
        name: image,
        tag: tagState,
        digest: digestState,
      }),
    );

    return (
      <List isPlain isBordered>
        {controllers.map((host) => {
          const href = `${host}/#/execution_environments/add?image=${imageUrl}`;

          return (
            <ListItem style={{ paddingTop: '8px' }} key={host}>
              <a href={href} target='_blank' rel='noreferrer'>
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
                  id={href}
                  textId={t`Copy to clipboard`}
                  onClick={() => navigator.clipboard.writeText(href)}
                >
                  {t`Copy to clipboard`}
                </ClipboardCopyButton>
              )}
            </ListItem>
          );
        })}
      </List>
    );
  };

  const { image, isOpen, onClose } = props;
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
          <a href={docsLink} target='_blank' rel='noreferrer'>
            {t`Learn more`}
          </a>{' '}
          <ExternalLinkAltIcon />
        </>
      )}
    </>
  );

  const closeAlert = () => {
    return closeAlertMixin('alerts');
  };

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
      <AlertList alerts={alerts} closeAlert={() => closeAlert()}></AlertList>
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
                      loadResults={(name) => fetchTags(image, name)}
                      onClear={() => {
                        setTagState(null);
                        setTagSelection([]);
                      }}
                      onSelect={(event, value) => {
                        const digest = digestByTag[value.toString()];
                        setTagState(digest && value.toString());
                        setTagSelection([{ id: value, name: value }]);
                        setDigestState(digest);
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
            {digestState && (
              <>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t`Digest`}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ShaLabel grey long digest={digestState} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </>
            )}
          </DescriptionList>
          <Spacer />
          <Trans>
            Click on the Controller URL that you want to use the above execution
            environment in, and it will launch that Controller&apos;s console.
            Log in (if necessary) and follow the steps to complete the
            configuration.
          </Trans>
          <br />
          {!unsafeLinksSupported && (
            <Trans>
              <b>Note:</b> The following links may be blocked by your browser.
              Copy and paste the external link manually.
            </Trans>
          )}
          <Spacer />

          <Flex>
            <FlexItem>
              <CompoundFilter
                inputText={inputText}
                onChange={(text) => setInputText(text)}
                updateParams={(controllerParams) => {
                  setControllerParams(controllerParams);
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
                  setControllerParams(controllerParams);
                }}
                count={controllerCount}
                isTop
              />
            </FlexItem>
          </Flex>

          <AppliedFilters
            updateParams={(controllerParams) => {
              setControllerParams(controllerParams);
            }}
            params={controllerParams}
            ignoredParams={['page_size', 'page']}
            niceNames={{
              host__icontains: t`Controller name`,
            }}
          />

          <Spacer />
          {renderControllers()}
          <Spacer />

          <Pagination
            params={controllerParams}
            updateParams={(controllerParams) => {
              setControllerParams(controllerParams);
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
};
