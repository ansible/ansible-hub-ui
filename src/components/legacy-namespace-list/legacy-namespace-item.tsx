import { t } from '@lingui/macro';
import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DropdownItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { LegacyNamespaceDetailType } from 'src/api';
import { Logo, StatefulDropdown } from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import './legacy-namespace-item.scss';

interface LegacyNamespaceProps {
  namespace: LegacyNamespaceDetailType;
  openModal: (namespace) => void;
}

export class LegacyNamespaceListItem extends React.Component<LegacyNamespaceProps> {
  render() {
    const { namespace } = this.props;
    const namespace_url = formatPath(Paths.legacyNamespace, {
      namespaceid: namespace.id,
    });

    const cells = [];

    cells.push(
      <DataListCell isFilled={false} alignRight={false} key='ns'>
        <Logo
          alt='logo'
          fallbackToDefault
          image={namespace.avatar_url}
          size='40px'
          unlockWidth
          width='97px'
        ></Logo>
      </DataListCell>,
    );

    cells.push(
      <DataListCell key='content' size={10}>
        <div>
          <Link to={namespace_url}>{namespace.name}</Link>
        </div>
      </DataListCell>,
    );

    const { ai_deny_index } = this.context.featureFlags;
    const summary_fields = namespace.summary_fields;
    const userOwnsLegacyNamespace = summary_fields?.owners?.filter(
      (n) => n.username == this.context.user.username,
    ).length;

    const showWisdom =
      ai_deny_index &&
      (this.context.user.is_superuser || userOwnsLegacyNamespace);

    const dropdownItems = [];

    dropdownItems.push(
      <DropdownItem onClick={() => this.props.openModal(namespace)}>
        {t`Ansible Lightspeed settings`}
      </DropdownItem>,
    );

    if (showWisdom) {
      cells.push(
        <DataListCell key='menu' alignRight={true}>
          <div style={{ float: 'right' }}>
            <StatefulDropdown items={dropdownItems} />
          </div>
        </DataListCell>,
      );
    }

    return (
      <DataListItem data-cy='LegacyNamespaceListItem'>
        <DataListItemRow>
          <DataListItemCells dataListCells={cells} />
        </DataListItemRow>
      </DataListItem>
    );
  }
}

LegacyNamespaceListItem.contextType = AppContext;
