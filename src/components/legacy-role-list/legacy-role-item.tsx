import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import './list-item.scss';

import {
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  LabelGroup,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import { Link } from 'react-router-dom';

import { Paths, formatPath } from 'src/paths';
import {
  NumericLabel,
  Tag,
  Logo,
  DeprecatedTag,
  DateComponent,
} from 'src/components';
import { convertContentSummaryCounts } from 'src/utilities';
import { Constants } from 'src/constants';
import { SignatureBadge } from '../signing';

interface IProps {
  //showNamespace?: boolean;
  name: string;
  namespace: string;
  latest_version: string;
  controls?: React.ReactNode;
  //repo?: string;
  //deprecated: boolean
  context: string;
  setState: string;
  forceUpdate: string;
  render: string;
}

export class LegacyRoleListItem extends React.Component<IProps> {
  render() {
    const {
      name,
      // download_count,
      latest_version,
      namespace,
      //showNamespace,
      controls,
      //deprecated,
      //repo,
      //sign_state,
    } = this.props;

    return (
        <h3>ROLE LIST ITEM</h3>
    );
  }
}
