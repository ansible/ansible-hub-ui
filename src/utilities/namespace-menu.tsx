import * as React from 'react';

import { DropdownItem, Tooltip } from '@patternfly/react-core';

import { RouteComponentProps, Redirect, Link } from 'react-router-dom';
import { t, Trans } from '@lingui/macro';

import { StatefulDropdown } from 'src/components';

import { formatPath, Paths } from 'src/paths';

class NamespaceMenuUtils {
  public click() {}

  public static deleteNamespace(container, namespace, detailMode) {
    if (detailMode) {
      container.setState({ isOpenNamespaceModal: true });
    } else {
      container.tryDeleteNamespace(namespace);
    }
  }

  public static signCollections(container, namespace, detailMode) {
    if (detailMode) {
      container.setState({ isOpenSignModal: true });
    } else {
      container.trySignAllCertificates(namespace);
    }
  }

  public static uploadCollection(container, namespace) {
    container.tryUploadCollection(namespace);
  }

  public static renderMenu(container, namespace, detailMode) {
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
              namespace: namespace.name,
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
                NamespaceMenuUtils.deleteNamespace(container, namespace, detailMode)
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
                namespace: namespace.name,
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
          onClick={() => NamespaceMenuUtils.signCollections(container, namespace, detailMode)}
        >
          {t`Sign all collections`}
        </DropdownItem>
      ),

      !detailMode && (
        <DropdownItem
          onClick={() => NamespaceMenuUtils.uploadCollection(container, namespace)}
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

export const namespaceMenu = NamespaceMenuUtils;
