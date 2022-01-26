import React from 'react';

export const HTMLComment = ({ text, ...props }) => (
  <div {...props} dangerouslySetInnerHTML={{ __html: `<!-- ${text} -->` }} />
);

export const UIVersion = () => (
  <HTMLComment
    className='hub-ui-version'
    text={`ansible-hub-ui ${UI_COMMIT_HASH}`}
  />
);
