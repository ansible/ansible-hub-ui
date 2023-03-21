import { t } from '@lingui/macro';
import { Button, Chip, ChipGroup } from '@patternfly/react-core';
import React from 'react';
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

export const AppliedFilters = ({
  className,
  ignoredParams = [],
  niceNames = {},
  niceValues,
  params,
  style,
  updateParams,
}: IProps) => {
  const filters = Object.keys(ParamHelper.getReduced(params, ignoredParams));
  if (!filters.length) {
    return null;
  }

  const renderGroup = (key) => {
    const chips = Array.isArray(params[key])
      ? (params[key] as string[] | number[])
      : [params[key]];

    const unsetFilter = (v) =>
      updateParams({
        ...ParamHelper.deleteParam(params, key, v),
        page: 1,
      });

    return (
      <div style={{ display: 'inline', marginRight: '8px' }} key={key}>
        <ChipGroup categoryName={niceNames[key] || key} {...chipGroupProps()}>
          {chips.map((v, i) => (
            <Chip key={i} onClick={() => unsetFilter(v)}>
              {niceValues?.[key]?.[v] || v}
            </Chip>
          ))}
        </ChipGroup>
      </div>
    );
  };

  return (
    <div className={className} style={style}>
      {filters.map((key) => renderGroup(key))}
      <Button
        onClick={() =>
          ParamHelper.clearAllFilters({ params, ignoredParams, updateParams })
        }
        variant='link'
      >
        {t`Clear all filters`}
      </Button>
    </div>
  );
};
