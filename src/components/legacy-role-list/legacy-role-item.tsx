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

import { LegacyRoleDetailType } from 'src/api/response-types/legacy-role';

interface LegacyRoleProps {
  role: LegacyRoleDetailType;
}

export class LegacyRoleListItem extends React.Component<LegacyRoleProps> {
  render() {
    const { role } = this.props;

    const cells = [];

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
          <Link to='/ui/legacy/roles/{role.namespace.name}/{role.name}'>
            {role.name}
          </Link>
          <TextContent>
            <Text component={TextVariants.small}>
              <Trans>Provided by {role.github_user}</Trans>
            </Text>
          </TextContent>
        </div>
        <div className='hub-entry'>{role.description}</div>
        <div className='hub-entry'>
          <LabelGroup>
            {role.summary_fields.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </LabelGroup>
        </div>
      </DataListCell>,
    );

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

    return (
      <DataListItem data-cy='LegacyRoleListItem'>
        <DataListItemRow>
          <DataListItemCells dataListCells={cells} />
        </DataListItemRow>
      </DataListItem>
    );
  }
}
