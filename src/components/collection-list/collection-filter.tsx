import { t } from '@lingui/macro';
import * as React from 'react';
import './collection-filter.scss';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { AppliedFilters, CompoundFilter } from 'src/components';
import { Constants } from 'src/constants';
import { AppContext } from 'src/loaders/app-context';

interface IProps {
  ignoredParams: string[];
  params: {
    keywords?: string;
    page?: number;
    page_size?: number;
    tags?: string[];
    view_type?: string;
    fingerprint?: string;
  };
  updateParams: (p) => void;
}

interface IState {
  inputText: string;
}

export class CollectionFilter extends React.Component<IProps, IState> {
  static contextType = AppContext;

  constructor(props) {
    super(props);

    this.state = {
      inputText: props.params.keywords || '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.keywords !== this.props.params['keywords']) {
      this.setState({ inputText: this.props.params['keywords'] || '' });
    }
  }

  render() {
    const { ignoredParams, params, updateParams } = this.props;
    const { display_signatures } = this.context?.featureFlags || {};

    const fingerprints =
      this.context?.settings.SIGNATURE_FINGERPRINT_LABELS || {};

    const filterConfig = [
      {
        id: 'keywords',
        title: t`Keywords`,
      },
      {
        id: 'tags',
        title: t`Tag`,
        inputType: 'multiple' as const,
        options: Constants.COLLECTION_FILTER_TAGS.map((tag) => ({
          id: tag,
          title: tag,
        })),
      },
      fingerprints && {
        id: 'signature_fingerprint',
        title: t`Signature Type`,
        inputType: 'select' as const,
        options: Object.keys(fingerprints).map((k) => ({
          id: k,
          title: k,
        })),
      },
      display_signatures && {
        id: 'sign_state',
        title: t`Sign state`,
        inputType: 'select' as const,
        options: [
          { id: 'signed', title: t`Signed` },
          { id: 'unsigned', title: t`Unsigned` },
        ],
      },
    ].filter(Boolean);

    return (
      <Toolbar>
        <ToolbarContent>
          <ToolbarGroup style={{ marginLeft: 0 }}>
            <ToolbarItem>
              <CompoundFilter
                inputText={this.state.inputText}
                onChange={(text) => this.setState({ inputText: text })}
                updateParams={updateParams}
                params={params}
                filterConfig={filterConfig}
              />
              <ToolbarItem>
                <AppliedFilters
                  niceNames={{
                    sign_state: t`sign state`,
                    tags: t`tags`,
                    keywords: t`keywords`,
                  }}
                  style={{ marginTop: '16px' }}
                  updateParams={updateParams}
                  params={params}
                  ignoredParams={ignoredParams}
                />
              </ToolbarItem>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    );
  }
}
