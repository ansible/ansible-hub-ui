import { t } from '@lingui/core/macro';
import { Label } from '@patternfly/react-core';
import React from 'react';
import { LabelGroup } from 'src/components';

export const PulpLabels = ({ labels }: { labels: Record<string, string> }) => {
  if (!labels || !Object.keys(labels).length) {
    return <>{t`None`}</>;
  }

  return (
    <LabelGroup>
      {Object.entries(labels).map(([k, v]) => (
        <Label key={k}>
          {k}
          {v ? ': ' + v : null}
        </Label>
      ))}
    </LabelGroup>
  );
};
