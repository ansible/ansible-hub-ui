import { t } from '@lingui/core/macro';
import {
  Dropdown,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core/deprecated';
import { type ReactNode, useState } from 'react';

interface IProps {
  /** List of patternfly DropdownItem components */
  items: ReactNode[];

  /** Callback fired when the user selects an item */
  onSelect?: (event) => void;

  /** If not specified, dropdown button will be a kebab. icon simply removes the dropdown indicator */
  toggleType?: 'dropdown' | 'icon' | 'kebab';

  /** Text to display on the component when it's not expanded*/
  defaultText?: ReactNode;

  /** Specifies if the dropdown should be aligned to the left or the right of the toggle button*/
  position?: 'left' | 'right';

  /** Toggles between plain and normal patternfly styling */
  isPlain?: boolean;

  ariaLabel?: string;
  'data-cy'?: string;
}

export const StatefulDropdown = ({
  items,
  onSelect: onSelectProp,
  toggleType = 'kebab',
  position,
  defaultText,
  isPlain = true,
  ariaLabel,
  'data-cy': dataCy,
}: IProps) => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(undefined);
  const onToggle = (_event, open) => setOpen(open);

  return (
    <Dropdown
      onSelect={(e) =>
        onSelect(e, { isOpen, onSelectProp, setOpen, setSelected })
      }
      toggle={renderToggle({ toggleType, defaultText, onToggle, selected })}
      isOpen={isOpen}
      isPlain={isPlain}
      dropdownItems={items}
      position={position || DropdownPosition.right}
      aria-label={ariaLabel}
      data-cy={dataCy}
    />
  );
};

function renderToggle({ toggleType, defaultText, onToggle, selected }) {
  switch (toggleType) {
    case 'dropdown':
      return (
        <DropdownToggle onToggle={onToggle}>
          {selected ? selected : defaultText || t`Dropdown`}
        </DropdownToggle>
      );
    case 'icon':
      return (
        <DropdownToggle toggleIndicator={null} onToggle={onToggle}>
          {selected ? selected : defaultText || t`Dropdown`}
        </DropdownToggle>
      );
    case 'kebab':
      return <KebabToggle onToggle={onToggle} />;
  }
}

function onSelect(event, { isOpen, onSelectProp, setOpen, setSelected }) {
  setOpen(!isOpen);
  setSelected(event.currentTarget.value);

  if (onSelectProp) {
    onSelectProp(event);
  }
}
