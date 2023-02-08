import React from 'react';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
}

const HTMLComment = ({ text, ...props }: IProps) => (
  <div {...props} dangerouslySetInnerHTML={{ __html: `<!-- ${text} -->` }} />
);

export const UIVersion = () => (
  <HTMLComment
    className='hub-ui-version'
    text={`ansible-hub-ui ${UI_COMMIT_HASH}`}
  />
);
