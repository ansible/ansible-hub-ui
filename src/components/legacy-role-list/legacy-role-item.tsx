import { Trans, t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  LabelGroup,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { LegacyRoleDetailType } from 'src/api/response-types/legacy-role';
import { DateComponent, Logo, Tag } from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { chipGroupProps } from 'src/utilities';
import './legacy-role-item.scss';

interface LegacyRoleProps {
  role: LegacyRoleDetailType;
  show_thumbnail: boolean;
}

export class LegacyRoleListItem extends React.Component<LegacyRoleProps> {
  render() {
    const { role, show_thumbnail } = this.props;
    const namespace = role.summary_fields.namespace;
    const role_url = formatPath(Paths.legacyRole, {
      username: role.github_user,
      name: role.name,
    });
    const namespace_url = formatPath(Paths.legacyNamespace, {
      namespaceid: namespace.id,
    });

    let release_date = null;
    let release_name = null;
    const lv = role.summary_fields.versions[0];
    if (lv !== undefined && lv !== null) {
      release_date = lv.release_date;
      release_name = lv.name;
    }
    if (
      release_date === undefined ||
      release_date === null ||
      release_date === ''
    ) {
      release_date = role.modified;
    }
    if (
      release_name === undefined ||
      release_name === null ||
      release_name === ''
    ) {
      release_name = '';
    }

    const cells = [];

    if (show_thumbnail !== false) {
      cells.push(
        <DataListCell isFilled={false} alignRight={false} key='ns'>
          <Logo
            alt={t`${role.github_user} logo`}
            image={role.summary_fields.namespace.avatar_url}
            size='70px'
            unlockWidth
            width='97px'
          ></Logo>
        </DataListCell>,
      );
    }

    cells.push(
      <DataListCell key='content'>
        <div>
          <Link to={role_url}>
            {namespace.name}.{role.name}
          </Link>
          <TextContent>
            <Text component={TextVariants.small}>
              <Trans>
                Provided by <Link to={namespace_url}>{namespace.name}</Link>
              </Trans>
            </Text>
          </TextContent>
        </div>
        <div className='hub-entry'>{role.description}</div>
        <div className='hub-entry'>
          <LabelGroup {...chipGroupProps()}>
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
            Updated <DateComponent date={release_date} />
          </Trans>
        </div>
        <div className='hub-entry'>{release_name}</div>
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
