import { t } from '@lingui/macro';
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Tr,
} from '@patternfly/react-table';
import React, { type FunctionComponent, type ReactNode, useState } from 'react';
import { SortTable } from 'src/components';

interface IProps {
  children: ReactNode;
  isCompact?: boolean;
  isStickyHeader?: boolean;
  params?: object;
  tableHeader?: {
    headers: {
      title: string;
      type: string;
      id: string;
    }[];
  };
  updateParams?: (params) => void;
}

export const RoleListTable: FunctionComponent<IProps> = ({
  children,
  isCompact,
  isStickyHeader = false,
  params,
  tableHeader,
  updateParams,
}) => {
  const defaultTableHeader = {
    headers: [
      {
        title: '',
        type: 'none',
        id: 'expander',
      },
      {
        title: t`Role`,
        type: 'alpha',
        id: 'role',
      },
      {
        title: t`Description`,
        type: 'none',
        id: 'description',
      },
      {
        title: t`Editable`,
        type: 'none',
        id: 'locked',
      },
      {
        title: '',
        type: 'none',
        id: 'kebab',
      },
    ],
  };

  return (
    <Table
      aria-label='role-list-table'
      data-cy='RoleListTable'
      variant={isCompact ? 'compact' : undefined}
      isStickyHeader={isStickyHeader}
    >
      <SortTable
        options={tableHeader ?? defaultTableHeader}
        params={params}
        updateParams={updateParams}
      />
      {children}
    </Table>
  );
};

export const ExpandableRow: FunctionComponent<{
  children: ReactNode;
  colSpan?: number;
  'data-cy'?: string;
  expandableRowContent?: ReactNode;
  rowIndex: number;
}> = ({ rowIndex, children, expandableRowContent, colSpan, ...props }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr data-cy={props['data-cy']}>
        <Td
          expand={{
            onToggle: () => setIsExpanded(!isExpanded),
            isExpanded,
            rowIndex,
          }}
        />
        {children}
      </Tr>
      {expandableRowContent && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={colSpan ?? 4}>
            {isExpanded && (
              <ExpandableRowContent>
                {expandableRowContent}
              </ExpandableRowContent>
            )}
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

export const CheckboxRow: FunctionComponent<{
  children: ReactNode;
  'data-cy'?: string;
  isDisabled?: boolean;
  isSelected: boolean;
  onSelect: (value) => void;
  rowIndex?: number;
}> = ({ rowIndex, children, isSelected, onSelect, isDisabled, ...props }) => (
  <Tbody>
    <Tr data-cy={props['data-cy']}>
      <Td
        select={{
          isDisabled: isDisabled,
          variant: 'checkbox',
          rowIndex,
          onSelect,
          isSelected,
        }}
      />
      {children}
    </Tr>
  </Tbody>
);

export const RadioRow: FunctionComponent<{
  children: ReactNode;
  'data-cy'?: string;
  isDisabled?: boolean;
  isSelected: boolean;
  onSelect: (value) => void;
  rowIndex?: number;
}> = ({ rowIndex, children, isSelected, onSelect, isDisabled, ...props }) => (
  <Tbody>
    <Tr data-cy={props['data-cy']}>
      <Td
        select={{
          isDisabled: isDisabled,
          variant: 'radio',
          rowIndex,
          onSelect,
          isSelected,
        }}
      />
      {children}
    </Tr>
  </Tbody>
);
