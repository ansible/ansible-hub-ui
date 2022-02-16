import React from 'react';
import PropTypes from 'prop-types';

export const HTMLComment = ({ text, ...props }) => (
  <div {...props} dangerouslySetInnerHTML={{ __html: `<!-- ${text} -->` }} />
);

HTMLComment.propTypes = { text: PropTypes.string };

export const UIVersion = () => (
  <HTMLComment
    className='hub-ui-version'
    text={`ansible-hub-ui ${UI_COMMIT_HASH}`}
  />
);
