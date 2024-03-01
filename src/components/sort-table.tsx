import ArrowsAltVIcon from '@patternfly/react-icons/dist/esm/icons/arrows-alt-v-icon';
import LongArrowAltDownIcon from '@patternfly/react-icons/dist/esm/icons/long-arrow-alt-down-icon';
import LongArrowAltUpIcon from '@patternfly/react-icons/dist/esm/icons/long-arrow-alt-up-icon';
import { Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import { ParamHelper } from 'src/utilities';
import './sort-table.scss';

interface IProps {
  options: {
    headers: {
      title: string;
      type: string;
      id: string;
      className?: string;
    }[];
  };
  params: {
    sort?: string;
  };
  updateParams: (params) => void;
}

export const SortTable = ({ options, params, updateParams }: IProps) => {
  function sort(id, isMinus) {
    // Alphabetical sorting is inverted in Django, so flip it here to make
    // things match up with the UI.
    isMinus = !isMinus;
    updateParams({
      ...ParamHelper.setParam(params, 'sort', (isMinus ? '-' : '') + id),
      page: 1,
    });
  }

  function getIcon(type, id) {
    if (type == 'none') {
      return;
    }

    let Icon;
    let isMinus = false;

    const activeIcon = !!params.sort && id == params.sort.replace('-', '');
    if (activeIcon) {
      isMinus = params.sort.includes('-');
      let up = isMinus;
      if (type == 'alpha') {
        up = !up;
      }
      Icon = up ? LongArrowAltDownIcon : LongArrowAltUpIcon;
    } else {
      Icon = ArrowsAltVIcon;
    }

    return (
      <Icon
        data-cy={'sort_' + id}
        size='sm'
        onClick={() => sort(id, isMinus)}
        className={'clickable ' + (activeIcon ? 'active' : 'inactive')}
      />
    );
  }

  const getHeaderItem = (item) => (
    <Th key={item.id} className={item?.className}>
      {item.title} {getIcon(item.type, item.id)}
    </Th>
  );

  return (
    <Thead>
      <Tr className='hub-SortTable-headers' data-cy='SortTable-headers'>
        {options.headers.map((element) => getHeaderItem(element))}
      </Tr>
    </Thead>
  );
};
