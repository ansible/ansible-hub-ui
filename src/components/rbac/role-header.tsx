import { Trans } from '@lingui/macro';
import { BaseHeader, BreadcrumbType, Breadcrumbs } from 'src/components';

interface IProps {
  title: string;
  subTitle?: string;
  breadcrumbs: BreadcrumbType[];
}

export const RoleHeader = ({ title, subTitle, breadcrumbs }: IProps) => (
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
