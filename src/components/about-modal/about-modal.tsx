import { t } from '@lingui/macro';
import {
  AboutModal,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { detect } from 'detect-browser';
import React, { useEffect, useState } from 'react';
import Logo from 'src/../static/images/logo_large.svg';
import { ApplicationInfoAPI, UserType } from 'src/api';

const Label = ({ children }: { children: React.ReactNode }) => (
  <TextListItem component={TextListItemVariants.dt}>{children}</TextListItem>
);

const Value = ({ children }: { children: React.ReactNode }) => (
  <TextListItem component={TextListItemVariants.dd}>{children}</TextListItem>
);

interface IProps {
  isOpen: boolean;
  trademark: string;
  brandImageSrc: string;
  onClose: () => void;
  brandImageAlt: string;
  productName: string;
  user: UserType;
  userName: string;
}

export const AboutModalWindow = ({
  isOpen,
  onClose,
  brandImageAlt,
  productName,
  user,
  userName,
}: IProps) => {
  const [applicationInfo, setApplicationInfo] = useState({
    galaxy_ng_commit: '',
    pulp_ansible_version: '',
    server_version: '',
    aap_version: '',
  });

  useEffect(() => {
    ApplicationInfoAPI.get().then((result) => {
      setApplicationInfo({
        galaxy_ng_commit: result.data.galaxy_ng_commit,
        pulp_ansible_version: result.data.pulp_ansible_version,
        server_version: result.data.server_version,
        aap_version: result.data?.aap_version,
      });
    });
  }, []);

  const browser = detect();

  return (
    <AboutModal
      isOpen={isOpen}
      trademark=''
      brandImageSrc={Logo}
      onClose={onClose}
      brandImageAlt={brandImageAlt}
      productName={productName}
    >
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <Label>{t`Server version`}</Label>
          <Value>
            {applicationInfo.server_version}
            <br />
            {applicationInfo.galaxy_ng_commit}
          </Value>

          <Label>{t`Pulp Ansible Version`}</Label>
          <Value>{applicationInfo.pulp_ansible_version}</Value>

          {applicationInfo?.aap_version && (
            <>
              <Label>{t`Ansible Automation Platform`}</Label>
              <Value>{applicationInfo.aap_version}</Value>
            </>
          )}

          <Label>{t`UI Version`}</Label>
          <Value>{UI_COMMIT_HASH}</Value>

          <Label>{t`Username`}</Label>
          <Value>{userName}</Value>

          <Label>{t`User Groups`}</Label>
          <Value>{user.groups.map((group) => group.name).join()}</Value>

          <Label>{t`Browser Version`}</Label>
          <Value>{browser.name + ' ' + browser.version}</Value>

          <Label>{t`Browser OS`}</Label>
          <Value>{browser.os}</Value>
        </TextList>
      </TextContent>
    </AboutModal>
  );
};
