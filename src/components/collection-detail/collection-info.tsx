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
import {
  CollectionAPI,
  CollectionVersionContentType,
  CollectionVersionSearch,
} from 'src/api';
import {
  ClipboardCopy,
  LoadingPageSpinner,
  LoginLink,
  Tag,
} from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { errorMessage } from 'src/utilities';
import './collection-info.scss';
import { DownloadSignatureGridItem } from './download-signature-grid-item';

interface IProps extends CollectionVersionSearch {
  params: {
    version?: string;
  };
  updateParams: (params) => void;
  addAlert?: (variant, title, description?) => void;
  content?: CollectionVersionContentType;
}

export const CollectionInfo = ({
  collection_version,
  repository,
  content,
  params,
  addAlert,
}: IProps) => {
  const downloadLinkRef = React.useRef<HTMLAnchorElement>(null);
  const context = useContext();

  let installCommand = `ansible-galaxy collection install ${collection_version.namespace}.${collection_version.name}`;

  if (params.version) {
    installCommand += `:${params.version}`;
  }

  if (!content) {
    return <LoadingPageSpinner />;
  }

  return (
    <div className='pf-c-content info-panel'>
      <h1>{t`Install`}</h1>
      <Grid hasGutter={true}>
        <GridItem>{collection_version.description}</GridItem>
        <GridItem>
          {collection_version.tags.map((tag, i) => (
            <Tag key={i}>{tag.name}</Tag>
          ))}
        </GridItem>

        {content.license?.length > 0 && (
          <GridItem>
            <Split hasGutter={true}>
              <SplitItem className='install-title'>{t`License`}</SplitItem>
              <SplitItem isFilled>
                {content.license ? content.license.join(', ') : ''}
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
            </SplitItem>
          </Split>
        </GridItem>
        <GridItem>
          <Split hasGutter={true}>
            <SplitItem className='install-title'>{t`Download`}</SplitItem>
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
              <SplitItem isFilled>
                <div>
                  <Trans>
                    To download this collection, configure your client to
                    connect to one of this repositories{' '}
                    <Link
                      to={formatPath(Paths.collectionDistributionsByRepo, {
                        repo: repository.name,
                        namespace: collection_version.namespace,
                        collection: collection_version.name,
                      })}
                    >
                      distributions
                    </Link>
                    .
                  </Trans>
                </div>
                <a ref={downloadLinkRef} style={{ display: 'none' }}></a>
                <Button
                  className='download-button'
                  variant='link'
                  data-cy='download-collection-tarball-button'
                  icon={<DownloadIcon />}
                  onClick={() =>
                    download(
                      repository,
                      collection_version.namespace,
                      collection_version.name,
                      collection_version.version,
                      downloadLinkRef,
                      addAlert,
                    )
                  }
                >
                  {t`Download tarball`}
                </Button>
              </SplitItem>
            )}
          </Split>
        </GridItem>
        <DownloadSignatureGridItem
          collectionVersion={collection_version}
          repository={repository}
          addAlert={(status, statusText) =>
            addAlert(
              'danger',
              t`Signatures could not be loaded.`,
              errorMessage(status, statusText),
            )
          }
        />
        {content?.requires_ansible && (
          <GridItem>
            <Split hasGutter={true}>
              <SplitItem className='install-title'>
                {t`Requires Ansible`}
              </SplitItem>
              <SplitItem isFilled data-cy='ansible-requirement'>
                {content?.requires_ansible}
              </SplitItem>
            </Split>
          </GridItem>
        )}

        {content?.docs_blob?.collection_readme ? (
          <GridItem>
            <div className='hub-readme-container'>
              <div
                className='pf-c-content'
                dangerouslySetInnerHTML={{
                  __html: content?.docs_blob?.collection_readme.html,
                }}
              />
              <div className='hub-fade-out'></div>
            </div>
            <Link
              to={formatPath(
                Paths.collectionDocsIndexByRepo,
                {
                  collection: collection_version.name,
                  namespace: collection_version.namespace,
                  repo: repository.name,
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
  repository: CollectionVersionSearch['repository'],
  namespace: string,
  name: string,
  version: string,
  downloadLinkRef,
  addAlert,
) {
  CollectionAPI.getDownloadURL(repository, namespace, name, version)
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
