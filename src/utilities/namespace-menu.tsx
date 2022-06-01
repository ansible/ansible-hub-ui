import * as React from 'react';

import { DropdownItem, Tooltip } from '@patternfly/react-core';

import { RouteComponentProps, Redirect, Link } from 'react-router-dom';
import { t, Trans } from '@lingui/macro';

import { StatefulDropdown } from 'src/components';

import { formatPath, Paths } from 'src/paths';

class NamespaceMenuUtils {
  public click() {}

  public deleteNamespace(container, namespace, detailMode) {
    if (detailMode) {
    } else {
    }
  }

  public signCollection(container, namespace, detailMode) {
    if (detailMode) {
    } else {
    }
  }

  public uploadCollection(container, namespace, detailMode) {
    if (detailMode) {
    } else {
    }
  }

  public getMenu(container, namespace, detailMode) {
    let showDeleteNamespace = true;
    let showSignCollections = true;

    if (detailMode) {
      showDeleteNamespace = container.state.isNamespaceEmpty;
      showSignCollections = container.state.canSign;
    }

    const dropdownItems = [
      <DropdownItem
        key='1'
        component={
          <Link
            to={formatPath(Paths.editNamespace, {
              namespace: container.state.namespace.name,
            })}
          >
            {t`Edit namespace`}
          </Link>
        }
      />,
      container.context.user.model_permissions.delete_namespace && (
        <React.Fragment key={'2'}>
          {showDeleteNamespace ? (
            <DropdownItem
              onClick={() =>
                this.deleteNamespace(container, namespace, detailMode)
              }
            >
              {t`Delete namespace`}
            </DropdownItem>
          ) : (
            <Tooltip
              isVisible={false}
              content={
                <Trans>
                  Cannot delete namespace until <br />
                  collections&apos; dependencies have <br />
                  been deleted
                </Trans>
              }
              position='left'
            >
              <DropdownItem isDisabled>{t`Delete namespace`}</DropdownItem>
            </Tooltip>
          )}
        </React.Fragment>
      ),
      <DropdownItem
        key='3'
        component={
          <Link
            to={formatPath(
              Paths.myImports,
              {},
              {
                namespace: container.state.namespace.name,
              },
            )}
          >
            {t`Imports`}
          </Link>
        }
      />,
      showSignCollections && (
        <DropdownItem
          key='sign-collections'
          onClick={() => this.signCollections(container, namespace, detailMode)}
        >
          {t`Sign all collections`}
        </DropdownItem>
      ),

      detailMode && (
        <DropdownItem
          onClick={() =>
            this.uploadCollection(container, namespace, detailMode)
          }
        >
          {t`Upload collection`}
        </DropdownItem>
      ),
    ].filter(Boolean);

    return (
      dropdownItems.length > 0 && <StatefulDropdown items={dropdownItems} />
    );
  }
}

export const namespaceMenuUtils = new NamespaceMenuUtils();
