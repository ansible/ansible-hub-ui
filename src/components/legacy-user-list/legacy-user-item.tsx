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

import { LegacyUserDetailType } from 'src/api/response-types/legacy-user';

interface LegacyUserProps {
  user: LegacyUserDetailType;
}

export class LegacyUserListItem extends React.Component<LegacyUserProps> {
  render() {
    const { user } = this.props;

    const cells = [];
    const user_url = '/legacy/users/' + user.username;

    cells.push(
      <DataListCell isFilled={false} alignRight={false} key='ns'>
        <Logo
          alt={t`role.github_user logo`}
          fallbackToDefault
          image='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
          size='40px'
          unlockWidth
          width='97px'
        ></Logo>
      </DataListCell>,
    );

    cells.push(
      <DataListCell key='content'>
        <div>
          <Link to={user_url}>
            {user.username}
          </Link>
        </div>
      </DataListCell>,
    );

    /*
    cells.push(
      <DataListCell isFilled={false} alignRight key='stats'>
        <div className='hub-right-col hub-entry'>
          <Trans>
            Updated{' '}
            <DateComponent
              date={role.summary_fields.versions[0].release_date}
            />
          </Trans>
        </div>
        <div className='hub-entry'>v{role.summary_fields.versions[0].name}</div>
      </DataListCell>,
    );
    */

    return (
      <DataListItem data-cy='LegacyUserListItem'>
        <DataListItemRow>
          <DataListItemCells dataListCells={cells} />
        </DataListItemRow>
      </DataListItem>
    );
  }
}
