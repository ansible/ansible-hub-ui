import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  type CodeEditorProps,
  CodeEditor as PFCodeEditor,
} from '@patternfly/react-code-editor';
import {
  type AlertProps,
  type BreadcrumbProps,
  type ChipGroupProps,
  type ChipProps,
  type ClipboardCopyButtonProps,
  type ClipboardCopyProps,
  type FileUploadProps,
  type IconComponentProps,
  type LabelGroupProps,
  type LoginFormProps,
  type NavListProps,
  Alert as PFAlert,
  Breadcrumb as PFBreadcrumb,
  Chip as PFChip,
  ChipGroup as PFChipGroup,
  ClipboardCopy as PFCopy,
  ClipboardCopyButton as PFCopyButton,
  FileUpload as PFFileUpload,
  Icon as PFIcon,
  NavList as PFNavList,
  Pagination as PFPagination,
  Popover as PFPopover,
  SearchInput as PFSearchInput,
  Spinner as PFSpinner,
  type PaginationProps,
  type PopoverProps,
  type SearchInputProps,
  type SpinnerProps,
} from '@patternfly/react-core';
import { LabelGroup as PFLabelGroup } from './label-group';
import { LoginForm as PFLoginForm } from './login-form';

const count = '${remaining}'; // pf templating

export const Alert = ({ variant, ...props }: AlertProps) => {
  const alertType = {
    success: t`Success`,
    danger: t`Danger`,
    warning: t`Warning`,
    info: t`Info`,
    custom: t`Custom`,
  }[variant || 'custom'];

  return (
    <PFAlert
      toggleAriaLabel={t`${alertType} alert details`}
      variantLabel={t`${alertType} alert:`}
      variant={variant}
      {...props}
    />
  );
};

export const Breadcrumb = (props: BreadcrumbProps) => (
  <PFBreadcrumb aria-label={t`Breadcrumb`} {...props} />
);

export const Chip = (props: Omit<ChipProps, 'ref'>) => (
  <PFChip closeBtnAriaLabel={t`close`} {...props} />
);

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

export const CodeEditor = (
  props: Omit<
    CodeEditorProps,
    | 'ref'
    | 'shortcutsPopoverButtonText'
    | 'toolTipCopyExitDelay'
    | 'toolTipDelay'
    | 'toolTipMaxWidth'
  > & {
    shortcutsPopoverButtonText?: string;
    toolTipCopyExitDelay?: number;
    toolTipDelay?: number;
    toolTipMaxWidth?: string;
  },
) => (
  <PFCodeEditor
    copyButtonAriaLabel={t`Copy code to clipboard`}
    copyButtonSuccessTooltipText={t`Content added to clipboard`}
    copyButtonToolTipText={t`Copy to clipboard`}
    downloadButtonAriaLabel={t`Download code`}
    downloadButtonToolTipText={t`Download`}
    emptyStateBody={t`Drag and drop a file or upload one.`}
    emptyStateButton={t`Browse`}
    emptyStateLink={t`Start from scratch`}
    emptyStateTitle={t`Start editing`}
    shortcutsPopoverButtonText={t`View Shortcuts`}
    uploadButtonAriaLabel={t`Upload code`}
    uploadButtonToolTipText={t`Upload`}
    {...props}
    shortcutsPopoverProps={{
      'aria-label': t`Keyboard Shortcuts`,
      ...props.shortcutsPopoverProps,
    }}
  />
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

export const Icon = (props: IconComponentProps) => (
  <PFIcon defaultProgressArialabel={t`Loading...`} {...props} />
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

export const NavList = (props: Omit<NavListProps, 'ref'>) => (
  <PFNavList
    backScrollAriaLabel={t`Scroll back`}
    forwardScrollAriaLabel={t`Scroll foward`}
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

export const Popover = (props: PopoverProps) => (
  <PFPopover closeBtnAriaLabel={t`close`} {...props} />
);

export const SearchInput = (props: SearchInputProps) => (
  <PFSearchInput
    hasWordsAttrLabel={t`Has words`}
    resetButtonLabel={t`Reset`}
    submitSearchButtonLabel={t`Search`}
    {...props}
  />
);

export const Spinner = (props: SpinnerProps) => (
  <PFSpinner aria-valuetext={t`Loading...`} {...props} />
);
