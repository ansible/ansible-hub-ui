import { Trans, t } from '@lingui/macro';
import { Tooltip } from '@patternfly/react-core';
import DownloadIcon from '@patternfly/react-icons/dist/esm/icons/download-icon';
import React from 'react';
import { language } from 'src/l10n';

interface IProps {
  item?: { download_count?: number };
}

export const DownloadCount = ({ item }: IProps) => {
  if (IS_INSIGHTS) {
    return null;
  }
  if (!item?.download_count) {
    return null;
  }

  const downloadCount = new Intl.NumberFormat(language).format(
    item.download_count,
  );

  return (
    <Tooltip
      content={t`Download count is the sum of all versions' download counts`}
    >
      <span>
        <DownloadIcon /> <Trans>{downloadCount} Downloads</Trans>
      </span>
    </Tooltip>
  );
};
