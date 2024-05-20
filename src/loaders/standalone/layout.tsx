import { Trans, t } from '@lingui/macro';
import {
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
} from '@patternfly/react-core';
import {
  DropdownItem,
  DropdownSeparator,
} from '@patternfly/react-core/deprecated';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import QuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';
import React, { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActiveUserAPI,
  type FeatureFlagsType,
  GatewayLogoutAPI,
  type SettingsType,
  type UserType,
} from 'src/api';
import {
  ExternalLink,
  HubAboutModal,
  LanguageSwitcher,
  LoginLink,
  SmallLogo,
  StatefulDropdown,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { StandaloneMenu } from './menu';

interface IProps {
  children: ReactNode;
  featureFlags: FeatureFlagsType;
  hasPermission: (string) => boolean;
  setUser: (user) => void;
  settings: SettingsType;
  user: UserType;
}

export const StandaloneLayout = ({
  children,
  featureFlags,
  hasPermission,
  setUser,
  settings,
  user,
}: IProps) => {
  const [aboutModalVisible, setAboutModalVisible] = useState<boolean>(false);
  const isGateway = featureFlags?.dab_resource_registry;

  let aboutModal = null;
  let docsDropdownItems = [];
  let userDropdownItems = [];
  let userName: string;

  if (user) {
    userName =
      [user.first_name, user.last_name].filter(Boolean).join(' ') ||
      user.username;

    userDropdownItems = [
      <DropdownItem isDisabled key='username'>
        <Trans>Username: {user.username}</Trans>
      </DropdownItem>,
      <DropdownSeparator key='separator' />,
      <DropdownItem
        key='profile'
        component={
          <Link
            to={formatPath(Paths.userProfileSettings)}
          >{t`My profile`}</Link>
        }
      />,

      <DropdownItem
        key='logout'
        aria-label={'logout'}
        onClick={() =>
          ActiveUserAPI.logout()
            .then(isGateway ? () => GatewayLogoutAPI.logout() : () => null)
            .then(() => ActiveUserAPI.getUser().catch(() => null))
            .then((user) => setUser(user))
        }
      >
        {t`Logout`}
      </DropdownItem>,
    ];

    docsDropdownItems = [
      <DropdownItem
        key='customer_support'
        component={
          <ExternalLink
            href='https://access.redhat.com/support'
            variant='menu'
          >{t`Customer Support`}</ExternalLink>
        }
      />,
      <DropdownItem
        key='training'
        component={
          <ExternalLink
            href='https://www.ansible.com/resources/webinars-training'
            variant='menu'
          >{t`Training`}</ExternalLink>
        }
      />,
      IS_COMMUNITY && (
        <DropdownItem
          key='forum'
          component={
            <ExternalLink
              href='https://forum.ansible.com'
              variant='menu'
            >{t`Ansible Community Forum`}</ExternalLink>
          }
        />
      ),
      IS_COMMUNITY && (
        <DropdownItem
          key='communication'
          component={
            <ExternalLink
              href='https://docs.ansible.com/ansible/latest/community/communication.html'
              variant='menu'
            >{t`Communicating with the Ansible community`}</ExternalLink>
          }
        />
      ),
      IS_COMMUNITY && (
        <DropdownItem
          key='communication'
          component={
            <ExternalLink
              href='https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/community/userguide/'
              variant='menu'
            >{t`Community User Guide`}</ExternalLink>
          }
        />
      ),
      <DropdownItem key='about' onClick={() => setAboutModalVisible(true)}>
        {t`About`}
      </DropdownItem>,
    ].filter(Boolean);

    aboutModal = (
      <HubAboutModal
        isOpen={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        user={user}
        userName={userName}
      />
    );
  }

  const Header = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton>
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand>
          <Link to={formatPath(Paths.landingPage)}>
            <SmallLogo alt={APPLICATION_NAME} />
          </Link>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <span style={{ flexGrow: 1 }} />
        <LanguageSwitcher />
        {user ? (
          <StatefulDropdown
            ariaLabel={t`Docs dropdown`}
            data-cy='docs-dropdown'
            defaultText={<QuestionCircleIcon />}
            items={docsDropdownItems}
            toggleType='icon'
          />
        ) : null}
        {!user || user.is_anonymous ? (
          <LoginLink />
        ) : (
          <StatefulDropdown
            ariaLabel={t`User dropdown`}
            data-cy='user-dropdown'
            defaultText={userName}
            items={userDropdownItems}
            toggleType='dropdown'
          />
        )}
      </MastheadContent>
    </Masthead>
  );

  const Sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        <StandaloneMenu
          context={{ user, settings, featureFlags, hasPermission }}
        />
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page isManagedSidebar header={Header} sidebar={Sidebar}>
      {children}
      {aboutModalVisible && aboutModal}
    </Page>
  );
};
