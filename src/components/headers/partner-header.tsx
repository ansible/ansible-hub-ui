import * as React from 'react';
import './header.scss';

import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { BaseHeader, Tabs, TabsType, Breadcrumbs } from 'src/components';
import { NamespaceType } from 'src/api';

interface IProps {
  namespace: NamespaceType;
  tabs: TabsType;
  breadcrumbs: {
    url?: string;
    name: string;
  }[];
  params: { tab?: string };
  updateParams: (p) => void;

  pageControls?: React.ReactNode;
  contextSelector?: React.ReactNode;
  filters?: React.ReactNode;
}

export class PartnerHeader extends React.Component<IProps, {}> {
  render() {
    const {
      breadcrumbs,
      contextSelector,
      filters,
      namespace,
      pageControls,
      params,
      tabs,
      updateParams,
    } = this.props;
    return (
      <BaseHeader
        title={namespace.company || namespace.name}
        imageURL={namespace.avatar_url}
        breadcrumbs={<Breadcrumbs links={breadcrumbs} />}
        pageControls={pageControls}
        contextSelector={contextSelector}
        className='header'
      >
        {namespace.description ? <div>{namespace.description}</div> : null}

        <div className='tab-link-container'>
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
