import { t } from '@lingui/macro';
import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import * as React from 'react';

interface IProps {
  /** Specify if the value is set on the backend already */
  isValueSet: boolean;

  /** Function to set the value to null */
  onClear: () => void;

  /** Component to display when the user is allowed to update this field. */
  children: React.ReactNode;
}

export class WriteOnlyField extends React.Component<IProps> {
  render() {
    const { onClear, isValueSet, children } = this.props;

    if (!isValueSet) {
      return children;
    }

    return (
      <InputGroup>
        <TextInput
          aria-label={t`hidden value`}
          placeholder='••••••••••••••••••••••'
          type='password'
          isDisabled={isValueSet}
        />
        {isValueSet && (
          <Button onClick={() => onClear()} variant='control'>
            {t`Clear`}
          </Button>
        )}
      </InputGroup>
    );
  }
}
