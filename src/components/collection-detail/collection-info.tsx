import { t, Trans } from '@lingui/macro';
import * as moment from 'moment';
import * as React from 'react';
import './collection-info.scss';

import { Link } from 'react-router-dom';

import {
  Split,
  SplitItem,
  Grid,
  GridItem,
  Button,
} from '@patternfly/react-core';

import { DownloadIcon } from '@patternfly/react-icons';

import { CollectionDetailType, CollectionAPI } from 'src/api';
import { Tag, ClipboardCopy } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { AppContext } from 'src/loaders/app-context';
import { userLanguage } from 'src/l10n';

interface IProps extends CollectionDetailType {
  params: {
    version?: string;
  };
  updateParams: (params) => void;
}

export class CollectionInfo extends React.Component<IProps> {
  downloadLinkRef: any;
  static contextType = AppContext;

  constructor(props) {
    super(props);
    this.downloadLinkRef = React.createRef();
  }

  render() {
    const { name, latest_version, namespace, params } = this.props;

    let installCommand = `ansible-galaxy collection install ${namespace.name}.${name}`;

    moment.locale(userLanguage);

    if (params.version) {
      installCommand += `:${params.version}`;
    }

    return (
      <div className='pf-c-content info-panel'>
        <h1>{t`Install`}</h1>
        <Grid hasGutter={true}>
          <GridItem>{latest_version.metadata.description}</GridItem>
          <GridItem>
            {latest_version.metadata.tags.map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
          </GridItem>

          <GridItem>
            <Split hasGutter={true}>
              <SplitItem className='install-title'>{t`License`}</SplitItem>
              <SplitItem isFilled>{latest_version.metadata.license}</SplitItem>
            </Split>
          </GridItem>
          <GridItem>
            <Split hasGutter={true}>
              <SplitItem className='install-title'>{t`Installation`}</SplitItem>
              <SplitItem isFilled>
                <ClipboardCopy isReadOnly>{installCommand}</ClipboardCopy>
                <div>
                  <Trans>
                    <b>Note:</b> Installing collections with ansible-galaxy is
                    only supported in ansible 2.9+
                  </Trans>
                </div>
                {this.context.user.is_guest ? (
                  <div>
                    {t`You have to be logged in to be able to download the tarball.`}{' '}
                    <Link to={Paths.login}>{t`Login`}</Link>
                  </div>
                ) : (
                  <div>
                    <a
                      ref={this.downloadLinkRef}
                      style={{ display: 'none' }}
                    ></a>
                    <Button
                      className='download-button'
                      variant='link'
                      icon={<DownloadIcon />}
                      onClick={() =>
                        this.download(
                          this.context.selectedRepo,
                          namespace,
                          name,
                          latest_version,
                        )
                      }
                    >
                      {t`Download tarball`}
                    </Button>
                  </div>
                )}
              </SplitItem>
            </Split>
          </GridItem>
          {latest_version.requires_ansible && (
            <GridItem>
              <Split hasGutter={true}>
                <SplitItem className='install-title'>
                  {t`Requires Ansible`}
                </SplitItem>
                <SplitItem isFilled>
                  {latest_version.requires_ansible}
                </SplitItem>
              </Split>
            </GridItem>
          )}

          {latest_version.docs_blob.collection_readme ? (
            <GridItem>
              <div className='readme-container'>
                <div
                  className='pf-c-content'
                  dangerouslySetInnerHTML={{
                    __html: latest_version.docs_blob.collection_readme.html,
                  }}
                />
                <div className='fade-out'></div>
              </div>
              <Link
                to={formatPath(
                  Paths.collectionDocsIndexByRepo,
                  {
                    collection: name,
                    namespace: namespace.name,
                    repo: this.context.selectedRepo,
                  },
                  params,
                )}
              >
                {t`Go to documentation`}
              </Link>
            </GridItem>
          ) : null}
        </Grid>
      </div>
    );
  }

  private download(reponame, namespace, name, latest_version) {
    CollectionAPI.getDownloadURL(
      reponame,
      namespace.name,
      name,
      latest_version.version,
    ).then((downloadURL: string) => {
      // By getting a reference to a hidden <a> tag, setting the href and
      // programmatically clicking it, we can hold off on making the api
      // calls to get the download URL until it's actually needed. Clicking
      // the <a> tag also gets around all the problems using a popup with
      // window.open() causes.
      this.downloadLinkRef.current.href = downloadURL;
      this.downloadLinkRef.current.click();
    });
  }
}
