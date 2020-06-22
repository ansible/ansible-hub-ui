import * as React from 'react';

import { Chip, ChipGroup } from '@patternfly/react-core';

import { ParamHelper } from '../../utilities';

interface IProps {
  /** Sets the current page params to p */
  updateParams: (p) => void;

  /** Current page params */
  params: object;

  /** A list of params that shouldn't get displayed */
  ignoredParams?: string[];

  /**
   * If k from param[k] is in nice names, use niceNames[k] instead of k
   * when displaying the param field name
   */
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
      <>
        {Object.keys(ParamHelper.getReduced(params, ignoredParams)).map(key =>
          this.renderGroup(key),
        )}
      </>
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
      <div style={{ display: 'inline', marginRight: '8px' }} key={key}>
        <ChipGroup categoryName={(niceNames[key] || key) as any}>
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
        </ChipGroup>
      </div>
    );
  }
}
