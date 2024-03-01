import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

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
