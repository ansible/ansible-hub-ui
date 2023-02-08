import { Trans } from '@lingui/macro';
import * as React from 'react';
import { BaseHeader, BreadcrumbType, Breadcrumbs } from 'src/components';

interface IProps {
  title: string;
  subTitle?: string;
  breadcrumbs: BreadcrumbType[];
}

export class RoleHeader extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { title, subTitle, breadcrumbs } = this.props;
    return (
      <BaseHeader
        breadcrumbs={<Breadcrumbs links={breadcrumbs}></Breadcrumbs>}
        title={title}
      >
        {' '}
        <div style={{ paddingBottom: '10px' }}>
          <Trans>{subTitle}</Trans>
        </div>
      </BaseHeader>
    );
  }
}
