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
import { Link } from 'react-router-dom';
import Logo from 'src/../static/images/logo_large.svg';
import { ApplicationInfoAPI, UserType } from 'src/api';
import { ExternalLink } from 'src/components';
import { Paths, formatPath } from 'src/paths';

const Label = ({ children }: { children: React.ReactNode }) => (
  <TextListItem component={TextListItemVariants.dt}>{children}</TextListItem>
);

const Value = ({ children }: { children: React.ReactNode }) => (
  <TextListItem component={TextListItemVariants.dd}>{children}</TextListItem>
);

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  userName: string;
}

interface IApplicationInfo {
  aap_version?: string;
  galaxy_importer_version?: string;
  galaxy_ng_commit?: string;
  galaxy_ng_version?: string;
  pulp_ansible_version?: string;
  pulp_container_version?: string;
  pulp_core_version?: string;
  server_version?: string;
}

export const AboutModalWindow = ({
  isOpen,
  onClose,
  user,
  userName,
}: IProps) => {
  const [applicationInfo, setApplicationInfo] = useState<IApplicationInfo>({});

  useEffect(() => {
    ApplicationInfoAPI.get().then(({ data }) => setApplicationInfo(data));
  }, []);

  const browser = detect();

  const {
    server_version, // 4.8.0dev
    galaxy_ng_version, // 4.8.0dev | 4.8.1
    galaxy_ng_commit, // origin/master:1234567 | master:12345678 | ""
    galaxy_importer_version, // 0.4.13
    pulp_core_version, // 3.28.12
    pulp_ansible_version, // 0.19.0
    pulp_container_version, // 2.15.2
    aap_version, // ?
  } = applicationInfo;

  const galaxy_ng_sha = galaxy_ng_commit?.split(':')[1];
  const ui_sha = UI_COMMIT_HASH?.slice(0, 7);

  return (
    <AboutModal
      brandImageAlt={t`Galaxy Logo`}
      brandImageSrc={Logo}
      isOpen={isOpen}
      onClose={onClose}
      productName={APPLICATION_NAME}
    >
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <Label>{t`Server version`}</Label>
          <Value>
            {server_version !== galaxy_ng_version ? (
              <>
                {server_version}
                <br />
              </>
            ) : null}
            {galaxy_ng_version?.includes('dev') ? (
              galaxy_ng_version
            ) : (
              <ExternalLink
                href={`https://github.com/ansible/galaxy_ng/releases/tag/${galaxy_ng_version}`}
                title={galaxy_ng_version}
              />
            )}
            {galaxy_ng_commit ? (
              <>
                <br />
                {galaxy_ng_sha ? (
                  <ExternalLink
                    href={`https://github.com/ansible/galaxy_ng/commit/${galaxy_ng_sha}`}
                    title={galaxy_ng_commit}
                  />
                ) : (
                  galaxy_ng_commit
                )}
              </>
            ) : null}
          </Value>

          <Label>{t`Pulp Ansible Version`}</Label>
          <Value>
            <ExternalLink
              href={`https://github.com/pulp/pulp_ansible/releases/tag/${pulp_ansible_version}`}
              title={pulp_ansible_version}
            />
          </Value>

          <Label>{t`Pulp Container Version`}</Label>
          <Value>
            <ExternalLink
              href={`https://github.com/pulp/pulp_container/releases/tag/${pulp_container_version}`}
              title={pulp_container_version}
            />
          </Value>

          <Label>{t`Pulp Core Version`}</Label>
          <Value>
            <ExternalLink
              href={`https://github.com/pulp/pulpcore/releases/tag/${pulp_core_version}`}
              title={pulp_core_version}
            />
          </Value>

          <Label>{t`Galaxy Importer`}</Label>
          <Value>
            <ExternalLink
              href={`https://github.com/ansible/galaxy-importer/releases/tag/v${galaxy_importer_version}`}
              title={galaxy_importer_version}
            />
          </Value>

          {aap_version && (
            <>
              <Label>{t`Ansible Automation Platform`}</Label>
              <Value>{aap_version}</Value>
            </>
          )}

          <Label>{t`UI Version`}</Label>
          <Value>
            <ExternalLink
              href={`https://github.com/ansible/ansible-hub/ui/commit/${ui_sha}`}
              title={ui_sha}
            />
          </Value>

          <Label>{t`Username`}</Label>
          <Value>
            <Link
              to={formatPath(Paths.userDetail, { userID: user.id })}
              title={user.username}
            >
              {userName}
            </Link>
          </Value>

          <Label>{t`User Groups`}</Label>
          <Value>
            {user.groups.map(({ id: group, name }, index) => (
              <>
                {index ? ', ' : null}
                <Link key={group} to={formatPath(Paths.groupDetail, { group })}>
                  {name}
                </Link>
              </>
            ))}
          </Value>

          <Label>{t`Browser Version`}</Label>
          <Value>{browser.name + ' ' + browser.version}</Value>

          <Label>{t`Browser OS`}</Label>
          <Value>{browser.os}</Value>
        </TextList>
      </TextContent>
    </AboutModal>
  );
};
