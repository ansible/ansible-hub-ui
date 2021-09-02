import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { Button, Modal, Select, SelectOption } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { sortBy } from 'lodash';
import { ControllerAPI, ImagesAPI } from 'src/api';
import { ShaLabel } from 'src/components';

interface IProps {
  image: string;
  digest?: string;
  isOpen: boolean;
  onClose: () => void;
  tag?: string;
}

interface IState {
  controllers: string[];
  controllersError: any;
  digest?: string;
  digestByTag: { [key: string]: string };
  loading: boolean;
  tag?: string;
  tagSelectOpen: boolean;
  tags: { tag: string; digest: string }[];
  tagsError: any;
}

export class PublishToControllerModal extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      controllers: [],
      controllersError: null,
      digest: null,
      digestByTag: {},
      loading: true,
      tag: null,
      tagSelectOpen: false,
      tags: [],
      tagsError: null,
    };
  }

  componentDidUpdate(prevProps) {
    const { image, isOpen } = this.props;

    if (isOpen !== prevProps.isOpen) {
      if (isOpen) {
        // load on open
        this.fetchData(image);
      } else {
        // reset on close
        this.setState({
          // controllers don't change
          digest: null,
          digestByTag: {},
          loading: true,
          tag: null,
          tagSelectOpen: false,
          tags: [],
          tagsError: null,
        });
      }
    }
  }

  fetchData(image) {
    let controllers;

    // only once
    if (!this.state.controllers.length) {
      controllers = ControllerAPI.list()
        .then(({ data }) =>
          this.setState({ controllers: data.data.map((c) => c.host) }),
        )
        .catch((e) => this.setState({ controllersError: e }));
    }

    const tags = ImagesAPI.list(image, { page_size: 1000 })
      .then(({ data }) => {
        // FIXME: no way to get a list of tags by updated? (this works, but the API should be doing the sorting)
        let tags = data.data.flatMap(({ digest, pulp_created, tags }) =>
          tags.map((tag) => ({ digest, pulp_created, tag })),
        );
        tags = sortBy(tags, 'pulp_created').reverse();

        // filter tags by digest when provided from Images list
        if (this.props.digest) {
          tags = tags.filter(({ digest }) => digest === this.props.digest);
        }

        const digestByTag = {};
        tags.forEach(({ digest, tag }) => (digestByTag[tag] = digest));

        let { digest, tag } = this.props;
        tag ||= tags[0]?.tag; // default to first tag unless in props (tags already filtered by digest if in props)
        digest ||= digestByTag[tag]; // set digest by tag unless in props

        this.setState({
          digest,
          digestByTag,
          tag,
          tags,
        });
      })
      .catch((e) => this.setState({ tagsError: e }));

    Promise.all([controllers, tags]).then(() =>
      this.setState({ loading: false }),
    );
  }

  render() {
    const { image, isOpen, onClose } = this.props;
    const {
      controllers,
      controllersError,
      loading,
      digest,
      digestByTag,
      tag,
      tagSelectOpen,
      tags,
      tagsError,
    } = this.state;

    const url = window.location.href.split('://')[1].split('/ui')[0];

    const controllerButtons = digest && isOpen && (
      <ul>
        {controllers.map((host) => {
          const hostname = host.replace(/^https?:\/\//, '');
          const imageUrl = `${url}/${tag ? `${image}:${tag}` : digest}`;
          const href = `${host}/#/execution_environments/add?image=${encodeURIComponent(
            imageUrl,
          )}`;

          return (
            <li>
              <a href={href} target='_blank'>
                <Trans>Publish to {hostname}</Trans>
              </a>
            </li>
          );
        })}
      </ul>
    );

    const docsLink = 'http://google.com'; // FIXME

    return (
      <Modal
        variant='large'
        title={t`Use in Controller`}
        isOpen={isOpen}
        onClose={onClose}
        actions={[
          <Button key='close' variant='secondary' onClick={onClose}>
            {t`Close`}
          </Button>,
        ]}
      >
        {loading && t`Loading...`}
        {controllersError && t`Error loading available Controllers`}
        {isOpen && !loading && !controllersError && (
          <>
            <b>
              <Trans>Execution Environment</Trans>
            </b>{' '}
            {image}
            <br />
            {tagsError ? (
              t`Error loading tags for ${image}`
            ) : (
              <>
                <b>
                  <Trans>Tag</Trans>
                </b>
                <Select
                  isOpen={tagSelectOpen}
                  onSelect={(event, value) => {
                    const digest = digestByTag[value.toString()];
                    this.setState({
                      tag: digest && value.toString(),
                      digest,
                      tagSelectOpen: false,
                    });
                  }}
                  onToggle={(tagSelectOpen) => {
                    this.setState({ tagSelectOpen });
                  }}
                  selections={tag}
                  variant='single'
                  placeholderText={t`Select a tag`}
                >
                  {tags.map(({ tag }) => (
                    <SelectOption key={tag} value={tag} />
                  ))}
                </Select>
              </>
            )}
            {digest && <ShaLabel digest={digest} />}
            {controllerButtons}
            <Trans>
              If the controller is not listed in the table, check settings.py.
            </Trans>{' '}
            {docsLink && (
              <>
                <a href={docsLink} target='_blank'>
                  <Trans>Learn more</Trans>
                </a>{' '}
                <ExternalLinkAltIcon />
              </>
            )}
          </>
        )}
      </Modal>
    );
  }
}
