import {
  Button,
  GenerateId,
  Label,
  Tooltip,
  TooltipPosition,
  fillTemplate,
} from '@patternfly/react-core';
import TimesCircleIcon from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';
import { css } from '@patternfly/react-styles';
import labelStyles from '@patternfly/react-styles/css/components/Label/label';
import styles from '@patternfly/react-styles/css/components/LabelGroup/label-group';
import React, {
  Children,
  Component,
  HTMLProps,
  MouseEvent,
  ReactNode,
  createRef,
} from 'react';
import { chipGroupProps } from 'src/utilities';

export interface LabelGroupProps extends HTMLProps<HTMLUListElement> {
  /** Content rendered inside the label group. Should be <Label> elements. */
  children?: ReactNode;
  /** Additional classes added to the label item */
  className?: string;
  /** Flag for having the label group default to expanded */
  defaultIsOpen?: boolean;
  /** Category name text for the label group category.  If this prop is supplied the label group with have a label and category styling applied */
  categoryName?: string;
  /** Aria label for label group that does not have a category name */
  'aria-label'?: string;
  /** Set number of labels to show before overflow */
  numLabels?: number;
  /** Flag if label group can be closed */
  isClosable?: boolean;
  /** Flag indicating the labels in the group are compact */
  isCompact?: boolean;
  /** Aria label for close button */
  closeBtnAriaLabel?: string;
  /** Function that is called when clicking on the label group close button */
  onClick?: (event: MouseEvent) => void;
  /** Position of the tooltip which is displayed if the category name text is longer */
  tooltipPosition?:
    | TooltipPosition
    | 'auto'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end';
  /** Flag to implement a vertical layout */
  isVertical?: boolean;
  /** Flag indicating contained labels are editable. Allows spacing for a text input after the labels. */
  isEditable?: boolean;
  /** Flag indicating the editable label group should be appended with a textarea. */
  hasEditableTextArea?: boolean;
  /** Additional props passed to the editable textarea. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editableTextAreaProps?: any;
  /** Control for adding new labels */
  addLabelControl?: ReactNode;
}

interface LabelGroupState {
  isOpen: boolean;
  isTooltipVisible: boolean;
}

// replaces LabelGroup for localization (chipGroupProps) and to fix button without type when rendering "show more" in forms
export class LabelGroup extends Component<LabelGroupProps, LabelGroupState> {
  static displayName = 'LabelGroup';
  constructor(props: LabelGroupProps) {
    super(props);
    this.state = {
      isOpen: this.props.defaultIsOpen,
      isTooltipVisible: false,
    };
  }
  private headingRef = createRef<HTMLSpanElement>();

  static defaultProps: LabelGroupProps = {
    categoryName: '',
    defaultIsOpen: false,
    numLabels: 3,
    isClosable: false,
    isCompact: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick: (_e: MouseEvent) => undefined as any,
    closeBtnAriaLabel: 'Close label group',
    tooltipPosition: 'top',
    'aria-label': 'Label group category',
    isVertical: false,
    isEditable: false,
    hasEditableTextArea: false,
  };

  componentDidMount() {
    this.setState({
      isTooltipVisible: Boolean(
        this.headingRef.current &&
          this.headingRef.current.offsetWidth <
            this.headingRef.current.scrollWidth,
      ),
    });
  }

  toggleCollapse = (e) => {
    // Label isOverflowLabel renders a button, but not button type=button, breaks forms
    e.preventDefault();

    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
      isTooltipVisible: Boolean(
        this.headingRef.current &&
          this.headingRef.current.offsetWidth <
            this.headingRef.current.scrollWidth,
      ),
    }));
  };

  renderLabel(id: string) {
    const { categoryName, tooltipPosition } = this.props;
    const { isTooltipVisible } = this.state;
    return isTooltipVisible ? (
      <Tooltip position={tooltipPosition} content={categoryName}>
        <span
          tabIndex={0}
          ref={this.headingRef}
          className={css(styles.labelGroupLabel)}
        >
          <span aria-hidden='true' id={id}>
            {categoryName}
          </span>
        </span>
      </Tooltip>
    ) : (
      <span
        ref={this.headingRef}
        className={css(styles.labelGroupLabel)}
        aria-hidden='true'
        id={id}
      >
        {categoryName}
      </span>
    );
  }

  render() {
    const {
      categoryName,
      children,
      className,
      isClosable,
      isCompact,
      closeBtnAriaLabel,
      'aria-label': ariaLabel,
      onClick,
      numLabels,
      /* eslint-disable @typescript-eslint/no-unused-vars */
      defaultIsOpen,
      tooltipPosition,
      isVertical,
      isEditable,
      hasEditableTextArea,
      editableTextAreaProps,
      addLabelControl,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...rest
    } = this.props;
    const { collapsedText, expandedText } = chipGroupProps();

    const { isOpen } = this.state;
    const renderedChildren = Children.toArray(children);
    const numChildren = renderedChildren.length;
    const collapsedTextResult = fillTemplate(collapsedText as string, {
      remaining: numChildren - numLabels,
    });

    const renderLabelGroup = (id: string) => {
      const labelArray = !isOpen
        ? renderedChildren.slice(0, numLabels)
        : renderedChildren;

      const content = (
        <>
          {categoryName && this.renderLabel(id)}
          <ul
            className={css(styles.labelGroupList)}
            {...(categoryName && { 'aria-labelledby': id })}
            {...(!categoryName && { 'aria-label': ariaLabel })}
            role='list'
            {...rest}
          >
            {labelArray.map((child, i) => (
              <li className={css(styles.labelGroupListItem)} key={i}>
                {child}
              </li>
            ))}
            {numChildren > numLabels && (
              <li className={css(styles.labelGroupListItem)}>
                <Label
                  isOverflowLabel
                  onClick={this.toggleCollapse}
                  className={css(isCompact && labelStyles.modifiers.compact)}
                >
                  {isOpen ? expandedText : collapsedTextResult}
                </Label>
              </li>
            )}
            {addLabelControl && (
              <li className={css(styles.labelGroupListItem)}>
                {addLabelControl}
              </li>
            )}
            {isEditable && hasEditableTextArea && (
              <li
                className={css(
                  styles.labelGroupListItem,
                  styles.modifiers.textarea,
                )}
              >
                <textarea
                  className={css(styles.labelGroupTextarea)}
                  rows={1}
                  tabIndex={0}
                  {...editableTextAreaProps}
                />
              </li>
            )}
          </ul>
        </>
      );

      const close = (
        <div className={css(styles.labelGroupClose)}>
          <Button
            variant='plain'
            aria-label={closeBtnAriaLabel}
            onClick={onClick}
            id={`remove_group_${id}`}
            aria-labelledby={`remove_group_${id} ${id}`}
          >
            <TimesCircleIcon aria-hidden='true' />
          </Button>
        </div>
      );

      return (
        <div
          className={css(
            styles.labelGroup,
            className,
            categoryName && styles.modifiers.category,
            isVertical && styles.modifiers.vertical,
            isEditable && styles.modifiers.editable,
          )}
        >
          {<div className={css(styles.labelGroupMain)}>{content}</div>}
          {isClosable && close}
        </div>
      );
    };

    return numChildren === 0 && addLabelControl === undefined ? null : (
      <GenerateId>
        {(randomId) => renderLabelGroup(this.props.id || randomId)}
      </GenerateId>
    );
  }
}
