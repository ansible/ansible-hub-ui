import { t } from '@lingui/macro';
import { Button, Chip, ChipGroup } from '@patternfly/react-core';
import * as React from 'react';
import { ParamHelper, ParamType, chipGroupProps } from 'src/utilities';

interface IProps {
  /** Sets the current page params to p */
  updateParams: (p) => void;

  /** Current page params */
  params: ParamType;

  /** A list of params that shouldn't get displayed */
  ignoredParams?: string[];

  /**
   * If k from param[k] is in nice names, use niceNames[k] instead of k
   * when displaying the param field name
   */
  niceNames?: object;
  niceValues?: object;
  style?: React.CSSProperties;
  className?: string;
}

export class AppliedFilters extends React.Component<IProps> {
  static defaultProps = {
    ignoredParams: [],
    niceNames: {},
  };

  render() {
    const { params, ignoredParams, className, style } = this.props;

    if (Object.keys(ParamHelper.getReduced(params, ignoredParams)).length > 0) {
      return (
        <div className={className} style={style}>
          {Object.keys(ParamHelper.getReduced(params, ignoredParams)).map(
            (key) => this.renderGroup(key),
          )}
          <Button onClick={this.clearAllFilters} variant='link'>
            {t`Clear all filters`}
          </Button>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderGroup(key: string) {
    const { niceNames, niceValues, params, updateParams } = this.props;
    const chips = Array.isArray(params[key])
      ? (params[key] as string[] | number[])
      : [params[key]];

    return (
      <div style={{ display: 'inline', marginRight: '8px' }} key={key}>
        <ChipGroup categoryName={niceNames[key] || key} {...chipGroupProps()}>
          {chips.map((v, i) => (
            <Chip
              key={i}
              onClick={() =>
                updateParams({
                  ...ParamHelper.deleteParam(params, key, v),
                  page: 1,
                })
              }
            >
              {niceValues?.[key]?.[v] || v}
            </Chip>
          ))}
        </ChipGroup>
      </div>
    );
  }

  private clearAllFilters = () => {
    const { params, ignoredParams, updateParams } = this.props;
    ParamHelper.clearAllFilters({ params, ignoredParams, updateParams });
  };
}
