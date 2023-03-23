import { t } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  CodeBlock,
  CodeBlockCode,
  GridItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';
import {
  AnsibleDistributionAPI,
  CollectionAPI,
  CollectionVersionSearch,
  findDistroBasePathByRepo,
} from 'src/api';
import 'src/api/response-types/collection';
import { useContext } from 'src/loaders/app-context';
import { LoadingPageSpinner } from '../loading/loading-page-spinner';

interface IProps {
  collectionVersion: CollectionVersionSearch['collection_version'];
  repository: CollectionVersionSearch['repository'];
  addAlert: (status, statusText) => void;
}

export const DownloadSignatureGridItem = ({
  collectionVersion,
  repository,
  addAlert,
}: IProps) => {
  const { display_signatures } = useContext().featureFlags;
  const [show, setShow] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // No signature object
  if (!display_signatures) {
    return null;
  }

  React.useEffect(() => {
    if (show && isLoading) {
      AnsibleDistributionAPI.list({
        repository: repository.pulp_href,
      }).then((result) => {
        const distroBasePath = findDistroBasePathByRepo(
          result.data.results,
          repository,
        );

        const { namespace, name, version } = collectionVersion;

        CollectionAPI.getSignatures(distroBasePath, namespace, name, version)
          .then((res) => {
            setSignatures(res.data.signatures);
            setIsLoading(false);
          })
          .catch(({ code, message }) => {
            addAlert(code, message);
            setIsLoading(false);
            setShow(false);
          });
      });
    }
  }, [show]);

  return (
    <>
      <GridItem>
        <Split hasGutter>
          <SplitItem className='install-title'>{t`Signature`}</SplitItem>
          <SplitItem>
            <Button
              style={{ padding: 0 }}
              variant={ButtonVariant.link}
              icon={<DownloadIcon />}
              data-cy='toggle-signature-button'
              onClick={() => {
                setShow(!show);
              }}
            >
              {show ? t`Hide the signature` : t`Show the signature`}
            </Button>
          </SplitItem>
        </Split>
      </GridItem>
      <GridItem>
        {show && (
          <>
            {isLoading ? (
              <LoadingPageSpinner />
            ) : (
              signatures.map(({ signature }, idx) => (
                <CodeBlock key={idx}>
                  <CodeBlockCode>{signature}</CodeBlockCode>
                </CodeBlock>
              ))
            )}
          </>
        )}
      </GridItem>
    </>
  );
};
