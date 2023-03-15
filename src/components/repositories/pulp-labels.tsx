import { t } from '@lingui/macro';
import { Label, LabelGroup } from '@patternfly/react-core';
import React from 'react';

export const PulpLabels = ({
  labels,
}: {
  labels: { [key: string]: string };
}) => {
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
