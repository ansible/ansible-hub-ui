import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';

export class BreadcrumbType {
  name: string;
  url?: string;
}

interface IProps {
  /** List of links to display in the breadcrumb */
  links: BreadcrumbType[];
}

export class Breadcrumbs extends React.Component<IProps> {
  render() {
    return (
      <Breadcrumb>
        {this.props.links.map((link, i) => this.renderLink(link, i))}
      </Breadcrumb>
    );
  }

  renderLink(link, index) {
    return (
      <BreadcrumbItem
        key={index}
        isActive={index + 1 === this.props.links.length}
      >
        {link.url ? <Link to={link.url}>{link.name}</Link> : link.name}
      </BreadcrumbItem>
    );
  }
}
