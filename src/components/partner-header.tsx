import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { type NamespaceType } from 'src/api';
import {
  BaseHeader,
  type BreadcrumbType,
  Breadcrumbs,
  ExternalLink,
  LinkTabs,
  type LinkTabsProps,
  Logo,
} from 'src/components';
import { namespaceTitle } from 'src/utilities';

interface IProps {
  breadcrumbs: BreadcrumbType[];
  filters?: ReactNode;
  namespace: NamespaceType;
  pageControls?: ReactNode;
  tabs: LinkTabsProps['tabs'];
}

export const PartnerHeader = ({
  breadcrumbs,
  filters,
  namespace,
  pageControls,
  tabs,
}: IProps) => {
  const title = namespaceTitle(namespace);

  return (
    <BaseHeader
      title={title}
      logo={
        namespace.avatar_url && (
          <Logo
            alt={t`${title} logo`}
            className='hub-header-image'
            fallbackToDefault
            image={namespace.avatar_url}
            size='40px'
            unlockWidth
          />
        )
      }
      breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
      pageControls={pageControls}
      className='hub-header-bordered'
    >
      {namespace.description ? (
        <div>
          {namespace.description.startsWith('http') &&
          !namespace.description.match(/\s/) ? (
            <ExternalLink href={namespace.description}>
              {namespace.description}
            </ExternalLink>
          ) : (
            namespace.description
          )}
        </div>
      ) : null}

      <div className='hub-tab-link-container'>
        <div className='tabs'>
          <LinkTabs tabs={tabs} />
        </div>
        {namespace.links.length > 0 ? (
          <div className='links'>
            {namespace.links.map((x, i) => {
              return (
                <div className='link' key={i}>
                  <ExternalLink href={x.url}>{x.name}</ExternalLink>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {filters || null}
    </BaseHeader>
  );
};
