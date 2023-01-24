import { t } from '@lingui/macro';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import {
  SortAlphaDownIcon,
  SortAlphaUpIcon,
  SortAmountDownIcon,
  SortAmountUpIcon,
} from '@patternfly/react-icons';
import React, { useState } from 'react';
import { ParamHelper } from 'src/utilities/param-helper';
import './sort.scss';

class SortFieldType {
  id: string;
  title: string;
  type: 'numeric' | 'alpha';
}

interface IProps {
  /** List of sort options that the user can pick from */
  options: SortFieldType[];

  /** Current page params */
  params: object;

  /** Sets the current page params to p */
  updateParams: (params) => void;

  /** Specify the name of the parameter that contains sort information */
  sortParamName?: string;
}

export const Sort = ({
  options,
  params,
  updateParams,
  sortParamName = 'sort',
}: IProps) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);

  const selectedOption = getSelected({ params, options, sortParamName });

  let IconDesc;
  let IconAsc;

  if (selectedOption.type === 'alpha') {
    IconAsc = SortAlphaDownIcon;
    IconDesc = SortAlphaUpIcon;
  } else {
    IconDesc = SortAmountDownIcon;
    IconAsc = SortAmountUpIcon;
  }

  return (
    <div className='hub-sort-wrapper'>
      {options.length > 1 ? (
        <Select
          variant={SelectVariant.single}
          aria-label={t`Sort results`}
          onToggle={(isExpanded) => setExpanded(isExpanded)}
          onSelect={(_, name) =>
            onSelect(name, {
              params,
              options,
              setExpanded,
              sortParamName,
              updateParams,
            })
          }
          selections={selectedOption.title}
          isOpen={isExpanded}
        >
          {options.map((option) => (
            <SelectOption key={option.id} value={option.title} />
          ))}
        </Select>
      ) : null}

      {getIsDescending({ params, sortParamName }) ? (
        <IconDesc
          className='clickable asc-button'
          size='md'
          onClick={() =>
            setDescending({ params, options, sortParamName, updateParams })
          }
        />
      ) : (
        <IconAsc
          className='clickable asc-button'
          size='md'
          onClick={() =>
            setDescending({ params, options, sortParamName, updateParams })
          }
        />
      )}
    </div>
  );
};

function onSelect(
  name,
  { params, options, setExpanded, sortParamName, updateParams },
) {
  let isDescending = getIsDescending({ params, sortParamName });

  const option = options.find((i) => i.title === name);

  // Alphabetical sorting is inverted in Django, so flip it here to make
  // things match up with the UI.
  if (option.type === 'alpha') {
    isDescending = !isDescending;
  }
  const desc = isDescending ? '-' : '';

  setExpanded(false, () =>
    updateParams({
      ...ParamHelper.setParam(params, sortParamName, desc + option.id),
      page: 1,
    }),
  );
}

function setDescending({ params, options, sortParamName, updateParams }) {
  const field = getSelected({ params, options, sortParamName });
  const descending = !getIsDescending({ params, sortParamName });

  updateParams({
    ...ParamHelper.setParam(
      params,
      sortParamName,
      (descending ? '-' : '') + field.id,
    ),
    page: 1,
  });
}

function getIsDescending({ params, sortParamName }) {
  const sort = params[sortParamName];

  // The ?sort= url param is not always guaranteed to be set. If it's
  // not set, return the default
  if (!sort) {
    return true;
  }
  return sort.startsWith('-');
}

function getSelected({ params, options, sortParamName }) {
  let sort = params[sortParamName];
  const def = options[0];

  if (!sort) {
    return def;
  }

  if (sort.startsWith('-')) {
    sort = sort.substring(1, sort.length);
  }

  const option = options.find((x) => x.id === sort);

  return option ? option : def;
}
