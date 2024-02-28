import { Trans, t } from '@lingui/macro';
import {
  ChipGroupProps,
  ClipboardCopyButtonProps,
  ClipboardCopyProps,
  FileUploadProps,
  LabelGroupProps,
  LoginFormProps,
  ChipGroup as PFChipGroup,
  ClipboardCopy as PFCopy,
  ClipboardCopyButton as PFCopyButton,
  FileUpload as PFFileUpload,
  Pagination as PFPagination,
  PaginationProps,
} from '@patternfly/react-core';
import React from 'react';
import { LabelGroup as PFLabelGroup } from './label-group';
import { LoginForm as PFLoginForm } from './login-form';

const count = '${remaining}'; // pf templating

export const ChipGroup = (props: Omit<ChipGroupProps, 'ref'>) => (
  <PFChipGroup
    collapsedText={t`${count} more`}
    expandedText={t`Show Less`}
    {...props}
  />
);

export const ClipboardCopy = (props: Omit<ClipboardCopyProps, 'ref'>) => (
  <PFCopy
    hoverTip={t`Copy to clipboard`}
    clickTip={t`Successfully copied to clipboard!`}
    textAriaLabel={t`Copyable input`}
    toggleAriaLabel={t`Show content`}
    {...props}
  />
);

export const ClipboardCopyButton = (props: ClipboardCopyButtonProps) => (
  <PFCopyButton aria-label={t`Copyable input`} {...props} />
);

export const FileUpload = (props: FileUploadProps) => (
  <PFFileUpload
    aria-label={t`File upload`}
    browseButtonText={t`Browse...`}
    clearButtonText={t`Clear`}
    filenamePlaceholder={t`Drag a file here or browse to upload`}
    {...props}
  />
);

export const LabelGroup = (props: Omit<LabelGroupProps, 'ref'>) => (
  <PFLabelGroup
    collapsedText={t`${count} more`}
    expandedText={t`Show Less`}
    {...props}
  />
);

export const LoginForm = (props: LoginFormProps) => (
  <PFLoginForm
    usernameLabel={t`Username`}
    passwordLabel={t`Password`}
    hidePasswordAriaLabel={t`Hide password`}
    showPasswordAriaLabel={t`Show password`}
    loginButtonLabel={t`Log In`}
    {...props}
  />
);

// AAP-3737 - support both "1 - 2 of 3" and "3 的 1 - 2"
const ToggleTemplate = ({
  firstIndex = 0,
  lastIndex = 0,
  itemCount = 0,
}: {
  firstIndex?: number;
  lastIndex?: number;
  itemCount?: number;
}) => (
  <Trans>
    <b>
      {firstIndex} - {lastIndex}
    </b>{' '}
    of <b>{itemCount}</b>
  </Trans>
);

export const Pagination = (props: Omit<PaginationProps, 'ref'>) => {
  const titles = {
    currPageAriaLabel: t`Current page`,
    items: '',
    itemsPerPage: t`Items per page`,
    ofWord: t`of`,
    optionsToggleAriaLabel: '',
    page: '',
    pages: '',
    paginationAriaLabel: t`Pagination`,
    perPageSuffix: t`per page`,
    toFirstPageAriaLabel: t`Go to first page`,
    toLastPageAriaLabel: t`Go to last page`,
    toNextPageAriaLabel: t`Go to next page`,
    toPreviousPageAriaLabel: t`Go to previous page`,
  };

  return (
    <PFPagination
      titles={titles}
      toggleTemplate={(props) => <ToggleTemplate {...props} />}
      {...props}
    />
  );
};
