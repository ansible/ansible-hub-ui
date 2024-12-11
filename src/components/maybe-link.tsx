import React, { type ReactNode } from 'react';
import { Link } from 'react-router';

export const MaybeLink = ({
  children,
  title,
  to,
}: {
  children: ReactNode;
  title?: string;
  to?: string;
}) =>
  to ? (
    <Link title={title} to={to}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
