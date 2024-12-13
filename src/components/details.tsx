import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { type ReactNode } from 'react';

interface IProps {
  item?: object;
  fields?: {
    label: string;
    value: string | number | boolean | ReactNode;
  }[];
}

export const Details = ({ item, fields = [] }: IProps) => (
  <>
    <DescriptionList isCompact>
      {fields.map(({ label, value }) => (
        <DescriptionListGroup key={label}>
          <DescriptionListTerm>{label}</DescriptionListTerm>
          <DescriptionListDescription>{value}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
    {item && (
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(item, null, 2)}
      </pre>
    )}
  </>
);
