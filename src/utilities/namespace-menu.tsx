import * as React from 'react';

import { DropdownItem, Tooltip, Text, Checkbox } from '@patternfly/react-core';

import { Link } from 'react-router-dom';
import { t, Trans } from '@lingui/macro';
import { formatPath, Paths, namespaceBreadcrumb } from 'src/paths';

import { StatefulDropdown, DeleteModal } from 'src/components';

import { NamespaceAPI } from 'src/api';

import { errorMessage } from 'src/utilities';

class NamespaceMenuUtils {
  public click() {}

  public static deleteNamespace(container, namespace, detailMode) {
    if (detailMode) {
      container.setState({ isOpenNamespaceModal: true });
    } else {
      NamespaceMenuUtils.tryDeleteNamespace(container, namespace);
    }
  }

  public static tryDeleteNamespace(container, namespace) {
    container.loadNamespace(namespace, () => {
      if (container.state.isNamespaceEmpty) {
        container.setState({
          namespace: namespace,
          isOpenNamespaceModal: true,
        });
      } else {
        container.addAlert({
          variant: 'warning',
          title: t`Namespace "${namespace.name}" could not be deleted.`,
          description: t`Namespace contains collections.`,
        });
      }
    });
  }

  public static deleteNamespaceConfirm(container, redirect) {
    const namespace = container.state.namespace;
    container.setState({ isNamespacePending: true }, () =>
      NamespaceAPI.delete(namespace.name)
        .then(() => {
          container.setState({
            confirmDelete: false,
            isNamespacePending: false,
            isOpenNamespaceModal: false,
          });
          container.addAlert({
            variant: 'success',
            title: (
              <Trans>
                Namespace &quot;{namespace.name}&quot; has been successfully
                deleted.
              </Trans>
            ),
          });

          if (redirect) {
            container.setState({
              redirect: formatPath(namespaceBreadcrumb.url, {}),
            });
          } else {
            container.loadAll();
          }
        })
        .catch((e) => {
          const { status, statusText } = e.response;
          container.setState({
            isOpenNamespaceModal: false,
            confirmDelete: false,
            isNamespacePending: false,
          });

          container.addAlert({
            variant: 'danger',
            title: t`Namespace "${namespace.name}" could not be deleted.`,
            description: errorMessage(status, statusText),
          });
        }),
    );
  }

  public static deleteModal(container, redirect: boolean) {
    return (
      <>
        {container.state.isOpenNamespaceModal && (
          <DeleteModal
            spinner={container.state.isNamespacePending}
            cancelAction={() => {
              container.setState({
                isOpenNamespaceModal: false,
                confirmDelete: false,
              });
            }}
            deleteAction={() =>
              NamespaceMenuUtils.deleteNamespaceConfirm(container, redirect)
            }
            title={t`Delete namespace?`}
            isDisabled={
              !container.state.confirmDelete ||
              container.state.isNamespacePending
            }
          >
            <>
              <Text className='delete-namespace-modal-message'>
                <Trans>
                  Deleting <b>{container.state.namespace.name}</b> and its data
                  will be lost.
                </Trans>
              </Text>
              <Checkbox
                isChecked={container.state.confirmDelete}
                onChange={(val) => container.setState({ confirmDelete: val })}
                label={t`I understand that this action cannot be undone.`}
                id='delete_confirm'
              />
            </>
          </DeleteModal>
        )}
      </>
    );
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
                NamespaceMenuUtils.deleteNamespace(
                  container,
                  namespace,
                  detailMode,
                )
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
          onClick={() =>
            NamespaceMenuUtils.signCollections(container, namespace, detailMode)
          }
        >
          {t`Sign all collections`}
        </DropdownItem>
      ),

      !detailMode && (
        <DropdownItem
          key='upload-collections'
          onClick={() =>
            NamespaceMenuUtils.uploadCollection(container, namespace)
          }
        >
          {t`Upload collection`}
        </DropdownItem>
      ),
    ].filter(Boolean);

    return (
      <div data-cy='ns-kebab-toggle'>
        {dropdownItems.length > 0 && <StatefulDropdown items={dropdownItems} />}
      </div>
    );
  }
}

export const namespaceMenu = NamespaceMenuUtils;
