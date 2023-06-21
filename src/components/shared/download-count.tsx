import { Trans } from '@lingui/macro';
import { DownloadIcon } from '@patternfly/react-icons';
import React from 'react';
import { language } from 'src/l10n';

interface IProps {
  item?: { download_count?: number };
}

export const DownloadCount = ({ item }) => {
  if (!item?.download_count) {
    return null;
  }

  const downloadCount = new Intl.NumberFormat(language).format(
    item.download_count,
  );

  return (
    <>
      <DownloadIcon /> <Trans>{downloadCount} Downloads</Trans>
    </>
  );
};
