import { Trans, t } from '@lingui/macro';
import {
  Alert,
  Button,
  Grid,
  GridItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CollectionAPI, CollectionDetailType } from 'src/api';
import { ClipboardCopy, LoginLink, Tag } from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { errorMessage } from 'src/utilities';
import './collection-info.scss';
import { DownloadSignatureGridItem } from './download-signature-grid-item';

interface IProps extends CollectionDetailType {
  params: {
    version?: string;
  };
  updateParams: (params) => void;
  addAlert?: (variant, title, description?) => void;
}

export const CollectionInfo = ({
  name,
  latest_version,
  namespace,
  params,
  addAlert,
}: IProps) => {
  const downloadLinkRef = React.useRef<HTMLAnchorElement>(null);
  const context = useContext();

  let installCommand = `ansible-galaxy collection install ${namespace.name}.${name}`;

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

        {latest_version?.metadata?.license?.length > 0 && (
          <GridItem>
            <Split hasGutter={true}>
              <SplitItem className='install-title'>{t`License`}</SplitItem>
              <SplitItem isFilled>
                {latest_version.metadata.license
                  ? latest_version.metadata.license.join(', ')
                  : ''}
              </SplitItem>
            </Split>
          </GridItem>
        )}
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
              {context.user.is_anonymous &&
              !context.settings
                .GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_DOWNLOAD ? (
                <Alert
                  className={'hub-collection-download-alert'}
                  isInline
                  variant='warning'
                  title={
                    <React.Fragment>
                      {t`You have to be logged in to be able to download the tarball.`}{' '}
                      <LoginLink />
                    </React.Fragment>
                  }
                />
              ) : (
                <div>
                  <a ref={downloadLinkRef} style={{ display: 'none' }}></a>
                  <Button
                    className='download-button'
                    variant='link'
                    data-cy='download-collection-tarball-button'
                    icon={<DownloadIcon />}
                    onClick={() =>
                      download(
                        context.selectedRepo,
                        namespace,
                        name,
                        latest_version,
                        downloadLinkRef,
                        addAlert,
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
        <DownloadSignatureGridItem version={latest_version} />
        {latest_version.requires_ansible && (
          <GridItem>
            <Split hasGutter={true}>
              <SplitItem className='install-title'>
                {t`Requires Ansible`}
              </SplitItem>
              <SplitItem isFilled data-cy='ansible-requirement'>
                {latest_version.requires_ansible}
              </SplitItem>
            </Split>
          </GridItem>
        )}

        {latest_version.docs_blob.collection_readme ? (
          <GridItem>
            <div className='hub-readme-container'>
              <div
                className='pf-c-content'
                dangerouslySetInnerHTML={{
                  __html: latest_version.docs_blob.collection_readme.html,
                }}
              />
              <div className='hub-fade-out'></div>
            </div>
            <Link
              to={formatPath(
                Paths.collectionDocsIndexByRepo,
                {
                  collection: name,
                  namespace: namespace.name,
                  repo: context.selectedRepo,
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
};

function download(
  reponame,
  namespace,
  name,
  latest_version,
  downloadLinkRef,
  addAlert,
) {
  CollectionAPI.getDownloadURL(
    reponame,
    namespace.name,
    name,
    latest_version.version,
  )
    .then((downloadURL: string) => {
      // By getting a reference to a hidden <a> tag, setting the href and
      // programmatically clicking it, we can hold off on making the api
      // calls to get the download URL until it's actually needed. Clicking
      // the <a> tag also gets around all the problems using a popup with
      // window.open() causes.
      downloadLinkRef.current.href = downloadURL;
      downloadLinkRef.current.click();
    })
    .catch((e) => {
      const { status, statusText } = e.response;
      addAlert(
        'danger',
        t`Collection "${name}" could not be downloaded.`,
        errorMessage(status, statusText),
      );
    });
}
