import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import React, { ReactNode } from 'react';

interface IProps {
  children?: ReactNode;
  className?: string;
  externalLinkIconStyle?: Record<string, string>;
  href: string;
  title?: string;
}

export const ExternalLink = ({
  children,
  className,
  externalLinkIconStyle,
  href,
  title,
}: IProps) => {
  if (!href || !title) {
    return null;
  }

  return (
    <>
      <a
        className={className}
        href={href}
        rel='noreferrer noopener'
        target='_blank'
      >
        {title || children}
      </a>{' '}
      <small style={{ display: 'inline' }}>
        <ExternalLinkAltIcon style={externalLinkIconStyle || {}} />
      </small>
    </>
  );
};
