import { t } from '@lingui/macro';
import {
  Button,
  ButtonVariant,
  DropdownItem,
  Label,
  LabelGroup,
  Spinner,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import DownloadIcon from '@patternfly/react-icons/dist/esm/icons/download-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import React from 'react';
import { Link } from 'react-router-dom';
import { CollectionAPI, CollectionVersionSearch } from 'src/api';
import { DateComponent, ListItemActions } from 'src/components';
import { Constants } from 'src/constants';
import { IAppContextType } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';

interface IProps {
  approve: (collectionVersion: CollectionVersionSearch) => void;
  collectionVersion: CollectionVersionSearch;
  context: IAppContextType;
  isVersionUpdating: (collectionVersion: CollectionVersionSearch) => boolean;
  openUploadCertificateModal: (
    collectionVersion: CollectionVersionSearch,
  ) => void;
  reject: (collectionVersion: CollectionVersionSearch) => void;
}

export const ApprovalRow = ({
  approve,
  collectionVersion,
  context: { featureFlags },
  isVersionUpdating,
  openUploadCertificateModal,
  reject,
}: IProps) => {
  const { collection_version: version, repository } = collectionVersion;
  const data_cy = `CertificationDashboard-row-${collectionVersion.repository.name}-${collectionVersion.collection_version.namespace}-${collectionVersion.collection_version.name}`;
  return (
    <tr data-cy={data_cy}>
      <td>{version.namespace}</td>
      <td>{version.name}</td>
      <td>
        <Link
          to={formatPath(
            Paths.collectionByRepo,
            {
              namespace: version.namespace,
              collection: version.name,
              repo: repository.name,
            },
            {
              version: version.version,
            },
          )}
        >
          {version.version}
        </Link>
        <Button
          variant={ButtonVariant.link}
          onClick={() => {
            download(
              repository,
              version.namespace,
              version.name,
              version.version,
            );
          }}
        >
          <DownloadIcon />
        </Button>
      </td>
      <td>
        <DateComponent date={version.pulp_created} />
      </td>
      <td>
        <LabelGroup>{repository.name}</LabelGroup>
      </td>
      <td>{renderStatus(collectionVersion)}</td>
      {renderButtons(collectionVersion)}
    </tr>
  );

  function renderButtons(collectionVersion: CollectionVersionSearch) {
    // not checking namespace permissions here, auto_sign happens API side, so is the permission check
    const { collection_version: version, repository } = collectionVersion;
    const {
      can_upload_signatures,
      collection_auto_sign,
      require_upload_signatures,
    } = featureFlags;
    if (isVersionUpdating(collectionVersion)) {
      return <ListItemActions />; // empty td;
    }

    const canUploadSignature =
      can_upload_signatures && !collectionVersion.is_signed;
    const mustUploadSignature = canUploadSignature && require_upload_signatures;
    const autoSign = collection_auto_sign && !require_upload_signatures;

    const approveButton = [
      canUploadSignature && (
        <React.Fragment key='upload'>
          <Button onClick={() => openUploadCertificateModal(collectionVersion)}>
            {t`Upload signature`}
          </Button>{' '}
        </React.Fragment>
      ),
      <Button
        key='approve'
        isDisabled={mustUploadSignature}
        data-cy='approve-button'
        onClick={() => approve(collectionVersion)}
      >
        {autoSign ? t`Sign and approve` : t`Approve`}
      </Button>,
    ].filter(Boolean);

    const importsLink = (
      <DropdownItem
        key='imports'
        component={
          <Link
            to={formatPath(
              Paths.myImports,
              {},
              {
                namespace: version.namespace,
                name: version.name,
                version: version.version,
              },
            )}
          >
            {t`View Import Logs`}
          </Link>
        }
      />
    );

    const certifyDropDown = (isDisabled: boolean) => (
      <DropdownItem
        onClick={() => approve(collectionVersion)}
        isDisabled={isDisabled}
        key='certify'
      >
        {autoSign ? t`Sign and approve` : t`Approve`}
      </DropdownItem>
    );

    const rejectDropDown = (isDisabled: boolean) => (
      <DropdownItem
        onClick={() => reject(collectionVersion)}
        isDisabled={isDisabled}
        key='reject'
      >
        {t`Reject`}
      </DropdownItem>
    );

    const repoStatus = repository.pulp_labels?.pipeline;

    if (isApproved(collectionVersion)) {
      return (
        <ListItemActions
          kebabItems={[
            certifyDropDown(true),
            rejectDropDown(false),
            importsLink,
          ]}
        />
      );
    }

    if (repoStatus === Constants.NOTCERTIFIED) {
      // render reject button if version is in multiple repositories including rejected state - handles inconsistency
      // and allows user to reject it again to move it all to rejected state
      return (
        <ListItemActions
          kebabItems={[
            certifyDropDown(false),
            rejectDropDown(true),
            importsLink,
          ]}
        />
      );
    }

    if (repoStatus === Constants.NEEDSREVIEW) {
      return (
        <ListItemActions
          kebabItems={[rejectDropDown(false), importsLink]}
          buttons={approveButton}
        />
      );
    }
  }

  function renderStatus(collectionVersion: CollectionVersionSearch) {
    const { repository } = collectionVersion;
    const repoStatus = repository.pulp_labels?.pipeline;

    if (isVersionUpdating(collectionVersion)) {
      return <Spinner size='lg' />;
    }

    if (isApproved(collectionVersion)) {
      const { display_signatures } = featureFlags;
      return (
        <Label variant='outline' color='green' icon={<CheckCircleIcon />}>
          {display_signatures && collectionVersion.is_signed
            ? t`Signed and approved`
            : t`Approved`}
        </Label>
      );
    }
    if (repoStatus === Constants.NOTCERTIFIED) {
      return (
        <Label variant='outline' color='red' icon={<ExclamationCircleIcon />}>
          {t`Rejected`}
        </Label>
      );
    }
    if (repoStatus === Constants.NEEDSREVIEW) {
      const { can_upload_signatures, require_upload_signatures } = featureFlags;
      return (
        <Label
          variant='outline'
          color='orange'
          icon={<ExclamationTriangleIcon />}
        >
          {!collectionVersion.is_signed &&
          can_upload_signatures &&
          require_upload_signatures
            ? t`Needs signature and review`
            : t`Needs review`}
        </Label>
      );
    }
  }

  function isApproved(collection: CollectionVersionSearch) {
    if (!collection) {
      return false;
    }

    return collection.repository?.pulp_labels?.pipeline === 'approved';
  }

  function download(
    repository: CollectionVersionSearch['repository'],
    namespace: string,
    name: string,
    version: string,
  ) {
    CollectionAPI.getDownloadURL(repository, namespace, name, version).then(
      (downloadURL: string) => {
        window.location.assign(downloadURL);
      },
    );
  }
};
