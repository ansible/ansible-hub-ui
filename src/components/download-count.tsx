import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import DownloadIcon from '@patternfly/react-icons/dist/esm/icons/download-icon';
import React from 'react';
import { Tooltip } from 'src/components';
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
      <DownloadIcon /> <Trans>{downloadCount} Downloads</Trans>
    </Tooltip>
  );
};
