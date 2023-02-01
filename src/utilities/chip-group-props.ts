import { t } from '@lingui/macro';

export const chipGroupProps = () => {
  const count = '${remaining}'; // pf templating
  return {
    collapsedText: t`${count} more`,
    expandedText: t`Show Less`,
  };
};
