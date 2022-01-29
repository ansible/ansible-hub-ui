import React, { FC, useState } from 'react';
import {
  Button,
  ButtonVariant,
  GridItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { CollectionVersionDetail } from 'src/api/response-types/collection';
import { t } from '@lingui/macro';

interface Props {
  version: CollectionVersionDetail;
}

const DownloadSignatureGridItem: FC<Props> = ({ version }) => {
  const [show, setShow] = useState(false);

  // No signature object or the signatures is empty
  if (version.metadata?.signatures?.length < 1) {
    return null;
  }

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
              onClick={() => {
                setShow(true);
              }}
            >
              {t`Show the signature`}
            </Button>
          </SplitItem>
        </Split>
      </GridItem>
      <GridItem>
        {show &&
          version.metadata.signatures.map(({ signature }) => (
            <code key={signature}>{signature}</code>
          ))}
      </GridItem>
    </>
  );
};

export default DownloadSignatureGridItem;
