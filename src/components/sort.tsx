import { t } from '@lingui/macro';
import {
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import SortAlphaDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-alpha-down-icon';
import SortAlphaUpIcon from '@patternfly/react-icons/dist/esm/icons/sort-alpha-up-icon';
import SortAmountDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';
import SortAmountUpIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-up-icon';
import React, { useState } from 'react';
import { Icon } from 'src/components';
import { ParamHelper } from 'src/utilities';

export interface SortFieldType {
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
  sortParamName,
  updateParams,
}: IProps) => {
  const [isExpanded, setExpanded] = useState(false);

  const sort = params[sortParamName || 'sort'];
  const isDescending = !sort ? true : sort.startsWith('-');
  const sortField = !sort
    ? options[0].id
    : isDescending
      ? sort.substring(1)
      : sort;
  const selectedOption = options.find(({ id }) => id === sortField);

  const update = (option, isDescending) =>
    updateParams({
      ...ParamHelper.setParam(
        params,
        sortParamName || 'sort',
        (isDescending ? '-' : '') + option.id,
      ),
      page: 1,
    });

  const onSelect = (name) => {
    const option = options.find(({ title }) => title === name);
    setExpanded(false);
    update(
      option,
      // alphabetical sorting is inverted in Django, so flip it here to make it match
      option.type === 'alpha' && selectedOption.type !== 'alpha'
        ? !isDescending
        : isDescending,
    );
  };

  const [IconAsc, IconDesc] =
    selectedOption.type === 'alpha'
      ? [SortAlphaDownIcon, SortAlphaUpIcon]
      : [SortAmountUpIcon, SortAmountDownIcon];

  const showSelect = options.length > 1;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {showSelect ? (
        <Select
          aria-label={t`Sort results`}
          isOpen={isExpanded}
          onSelect={(_e, name) => onSelect(name)}
          onToggle={(_e, expanded) => setExpanded(expanded)}
          selections={selectedOption.title}
          variant={SelectVariant.single}
        >
          {options.map(({ id, title }) => (
            <SelectOption key={id} value={title} />
          ))}
        </Select>
      ) : null}

      <Icon
        className='clickable'
        onClick={() => update(selectedOption, !isDescending)}
        style={{ margin: showSelect ? '6px 0 6px 5px' : '10px 0 6px 5px' }}
      >
        {isDescending ? <IconDesc /> : <IconAsc />}
      </Icon>
    </div>
  );
};
