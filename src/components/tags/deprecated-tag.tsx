import { t } from '@lingui/macro';
import React from 'react';

export const DeprecatedTag = () => (
  <div
    style={{
      display: 'inline-block',
      margin: '4px',
      backgroundColor: '#C9190B',
      color: 'white',
      fontSize: '14px',
      paddingLeft: '5px',
      paddingRight: '5px',
      paddingBottom: '2px',
      paddingTop: '2px',
      borderRadius: '3px',
    }}
  >
    {t`DEPRECATED`}
  </div>
);
