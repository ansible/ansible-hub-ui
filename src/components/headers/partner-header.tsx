import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { NamespaceType } from 'src/api';
import {
  BaseHeader,
  BreadcrumbType,
  Breadcrumbs,
  ExternalLink,
  Logo,
  Tabs,
  TabsType,
} from 'src/components';
import { namespaceTitle } from 'src/utilities';

interface IProps {
  namespace: NamespaceType;
  tabs: TabsType[];
  breadcrumbs: BreadcrumbType[];
  params: { tab?: string };
  updateParams: (p) => void;

  pageControls?: React.ReactNode;
  filters?: React.ReactNode;
}

export class PartnerHeader extends Component<IProps> {
  render() {
    const {
      breadcrumbs,
      filters,
      namespace,
      pageControls,
      params,
      tabs,
      updateParams,
    } = this.props;

    const title = namespaceTitle(namespace);

    return (
      <BaseHeader
        title={title}
        logo={
          namespace.avatar_url && (
            <Logo
              alt={t`${title} logo`}
              className='image'
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
            <Tabs
              tabs={tabs}
              params={params}
              updateParams={(p) => updateParams(p)}
            />
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
  }
}
