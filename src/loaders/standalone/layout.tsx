import { Trans, t } from '@lingui/macro';
import {
  DropdownItem,
  DropdownSeparator,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
} from '@patternfly/react-core';
import QuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ActiveUserAPI,
  FeatureFlagsType,
  SettingsType,
  UserType,
} from 'src/api';
import {
  AboutModalWindow,
  ExternalLink,
  LanguageSwitcher,
  LoginLink,
  SmallLogo,
  StatefulDropdown,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { StandaloneMenu } from './menu';

interface IProps {
  children: React.ReactNode;
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
  const location = useLocation();

  const [aboutModalVisible, setAboutModalVisible] = useState<boolean>(false);

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
      <DropdownItem key='about' onClick={() => setAboutModalVisible(true)}>
        {t`About`}
      </DropdownItem>,
    ];

    aboutModal = (
      <AboutModalWindow
        isOpen={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        user={user}
        userName={userName}
      />
    );
  }

  const Header = (
    <PageHeader
      logo={<SmallLogo alt={APPLICATION_NAME} />}
      logoComponent={({ children }) => (
        <Link to={formatPath(Paths.landingPage)}>{children}</Link>
      )}
      headerTools={
        <PageHeaderTools>
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
            <LoginLink next={location.pathname} />
          ) : (
            <StatefulDropdown
              ariaLabel={t`User dropdown`}
              data-cy='user-dropdown'
              defaultText={userName}
              items={userDropdownItems}
              toggleType='dropdown'
            />
          )}
        </PageHeaderTools>
      }
      showNavToggle
    />
  );

  const Sidebar = (
    <PageSidebar
      theme='dark'
      nav={
        <StandaloneMenu
          context={{ user, settings, featureFlags, hasPermission }}
        />
      }
    />
  );

  return (
    <Page isManagedSidebar={true} header={Header} sidebar={Sidebar}>
      {children}
      {aboutModalVisible && aboutModal}
    </Page>
  );
};
