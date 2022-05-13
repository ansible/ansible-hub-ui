import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  Button,
  DropdownItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import './namespace-form.scss';
import { GroupType, NamespaceType } from 'src/api';
import {
  DeleteModal,
  EmptyStateNoData,
  ListItemActions,
  LoadingPageSpinner,
  SortTable,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { errorMessage } from 'src/utilities';

interface IProps {
  addAlert: (alert) => void;
  namespace: NamespaceType;
  updateNamespace: (namespace) => void;
  location: RouteComponentProps['location'];
  history: RouteComponentProps['history'];
}

interface IState {
  groups: GroupType[];
  loading: boolean;
  showGroupRemoveModal?: GroupType;
}

export class NamespaceOwnersForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      groups: [],
      loading: true,
      showGroupRemoveModal: null,
    };
  }

  componentDidMount() {
    this.queryGroups();
  }

  render() {
    const { namespace } = this.props;
    const { groups, loading, showGroupRemoveModal } = this.state;
    const noData = groups.length === 0;

    if (!namespace) {
      return null;
    }

    const buttonAdd = (
      <Button
        onClick={() =>
          // TODO
          this.setState({})
        }
      >
        {t`Select a group`}
      </Button>
    );

    return loading ? (
      <LoadingPageSpinner />
    ) : noData ? (
      <EmptyStateNoData
        title={t`There are currently no owners assigned.`}
        description={t`Please add an owner by using the button below.`}
        button={buttonAdd}
      />
    ) : (
      <>
        {showGroupRemoveModal ? this.renderGroupRemoveModal() : null}
        <div className='hub-group-list-toolbar'>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>{buttonAdd}</ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </div>

        <table
          aria-label={t`Group list`}
          className='hub-c-table-content pf-c-table'
        >
          <SortTable
            options={{
              headers: [
                {
                  title: t`Group`,
                  type: 'none',
                  id: 'name',
                },
                {
                  title: '',
                  type: 'none',
                  id: 'kebab',
                },
              ],
            }}
            params={{}}
            updateParams={() => null}
          />
          <tbody>
            {groups.map((group, i) => this.renderTableRow(group, i))}
          </tbody>
        </table>
      </>
    );
  }

  private renderTableRow(group, index: number) {
    const dropdownItems = [
      <DropdownItem
        key='remove'
        onClick={() => {
          this.setState({
            showGroupRemoveModal: group,
          });
        }}
      >
        <Trans>Remove group</Trans>
      </DropdownItem>,
    ];

    return (
      <tr data-cy={`NamespaceOwnersForm-row-${group.name}`} key={index}>
        <td>
          <Link
            target='_blank'
            to={formatPath(Paths.groupDetail, {
              group: group.id,
            })}
          >
            {group.name}
          </Link>
        </td>
        <ListItemActions kebabItems={dropdownItems} />
      </tr>
    );
  }

  private queryGroups() {
    this.setState({ groups: this.props.namespace.groups, loading: false });
  }

  private renderGroupRemoveModal() {
    const group = this.state.showGroupRemoveModal as GroupType;
    const groupname = group.name;

    return (
      <DeleteModal
        cancelAction={() => this.setState({ showGroupRemoveModal: null })}
        deleteAction={() => this.removeGroup(group)}
        title={t`Remove group: ${groupname}?`}
      >
        <Trans>
          You are about to remove <b>{groupname}</b>.
          <br />
          This will also remove all associated permissions under this role.
        </Trans>
      </DeleteModal>
    );
  }

  private removeGroup(group) {
    const { namespace, updateNamespace } = this.props;
    console.log('TODO removeGroup', group, namespace);
    // TODO updateNamespace({ ...namespace, groups: namespace.groups.filter((g) => g !== group) })
    Promise.resolve()
      .then(() => {
        this.setState({
          showGroupRemoveModal: null,
        });
        this.props.addAlert({
          title: t`Group "${group.name}" has been successfully removed from namespace "${namespace.name}".`,
          variant: 'success',
        });
        this.queryGroups();
      })
      .catch(({ response: { status, statusText } }) => {
        this.props.addAlert({
          title: t`Group "${group.name}" could not be removed from namespace "${namespace.name}".`,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
  }
}
