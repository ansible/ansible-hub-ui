import { t } from '@lingui/macro';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { NamespaceType } from 'src/api';
import {
  BaseHeader,
  BreadcrumbType,
  Breadcrumbs,
  Logo,
  Tabs,
  TabsType,
} from 'src/components';
import './header.scss';

interface IProps {
  namespace: NamespaceType;
  tabs: TabsType[];
  breadcrumbs: BreadcrumbType[];
  params: { tab?: string };
  updateParams: (p) => void;

  pageControls?: React.ReactNode;
  filters?: React.ReactNode;
}

export class PartnerHeader extends React.Component<IProps> {
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

    const company = namespace.company || namespace.name;

    return (
      <BaseHeader
        title={company}
        logo={
          namespace.avatar_url && (
            <Logo
              alt={t`${company} logo`}
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
        className='header'
      >
        {namespace.description ? <div>{namespace.description}</div> : null}

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
              <div>
                <ExternalLinkAltIcon />
              </div>
              {namespace.links.map((x, i) => {
                return (
                  <div className='link' key={i}>
                    <a href={x.url} target='blank'>
                      {x.name}
                    </a>
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
