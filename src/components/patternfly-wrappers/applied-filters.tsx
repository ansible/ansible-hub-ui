import * as React from 'react';

import { Chip, ChipGroup, ChipGroupToolbarItem } from '@patternfly/react-core';

import { ParamHelper } from '../../utilities';

interface IProps {
  updateParams: (p) => void;
  params: object;
  ignoredParams?: string[];

  // If k from param[k] is in nice names, use niceNames[k] instead of k
  // when displaying the param field name
  niceNames?: object;
}

export class AppliedFilters extends React.Component<IProps, {}> {
  static defaultProps = {
    ignoredParams: [],
    niceNames: {},
  };

  render() {
    const { params, ignoredParams } = this.props;

    return (
      <ChipGroup withToolbar>
        {Object.keys(ParamHelper.getReduced(params, ignoredParams)).map(key =>
          this.renderGroup(key),
        )}
      </ChipGroup>
    );
  }

  private renderGroup(key: string) {
    const { niceNames, params, updateParams } = this.props;

    let chips;

    if (Array.isArray(params[key])) {
      chips = params[key];
    } else {
      chips = [params[key]];
    }

    return (
      <ChipGroupToolbarItem categoryName={niceNames[key] || key} key={key}>
        {chips.map((v, i) => (
          <Chip
            key={i}
            onClick={() =>
              updateParams(ParamHelper.deleteParam(params, key, v))
            }
          >
            {v}
          </Chip>
        ))}
      </ChipGroupToolbarItem>
    );
  }
}
