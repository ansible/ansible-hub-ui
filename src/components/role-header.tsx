import { BaseHeader, type BreadcrumbType, Breadcrumbs } from 'src/components';

interface IProps {
  title: string;
  subTitle?: string;
  breadcrumbs: BreadcrumbType[];
}

export const RoleHeader = ({ title, subTitle, breadcrumbs }: IProps) => (
  <BaseHeader breadcrumbs={<Breadcrumbs links={breadcrumbs} />} title={title}>
    {' '}
    <div style={{ paddingBottom: '10px' }}>{subTitle}</div>
  </BaseHeader>
);
