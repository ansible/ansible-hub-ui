import React from 'react';

interface IProps {
  item?: object;
  fields?: { label: string; value: any }[];
}

export const Details = ({ item, fields = [] }: IProps) => (
  <>
    {fields.map(({ label, value }) => (
      <div key={label}>
        <div>
          <b>{label}</b>
        </div>
        <div>{value}</div>
      </div>
    ))}
    {item && (
      <>
        <hr />
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(item, null, 2)}
        </pre>
      </>
    )}
  </>
);
