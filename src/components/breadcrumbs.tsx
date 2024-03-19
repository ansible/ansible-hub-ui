import { BreadcrumbItem } from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'src/components';

export interface BreadcrumbType {
  name: string;
  url?: string;
}

interface IProps {
  /** List of links to display in the breadcrumb */
  links: BreadcrumbType[];
}

export const Breadcrumbs = ({ links }: IProps) => (
  <Breadcrumb>
    {links.map((link, index) => (
      <BreadcrumbItem key={index} isActive={index + 1 === links.length}>
        {link.url ? <Link to={link.url}>{link.name}</Link> : link.name}
      </BreadcrumbItem>
    ))}
  </Breadcrumb>
);
