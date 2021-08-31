import * as React from 'react';

export class DeprecatedTag extends React.Component<{}, {}> {
  render() {
    return (
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
  }
}
