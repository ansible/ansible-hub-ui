import { Trans, t } from '@lingui/macro';
import {
  DropdownItem,
  DropdownSeparator,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from 'src/../static/images/logo_large.svg';
import {
  ActiveUserAPI,
  FeatureFlagsType,
  SettingsType,
  UserType,
} from 'src/api';
import {
  AboutModalWindow,
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
    if (user.first_name || user.last_name) {
      userName = user.first_name + ' ' + user.last_name;
    } else {
      userName = user.username;
    }

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
      ></DropdownItem>,

      <DropdownItem
        key='logout'
        aria-label={'logout'}
        onClick={() => ActiveUserAPI.logout().then(() => setUser(null))}
      >
        {t`Logout`}
      </DropdownItem>,
    ];

    docsDropdownItems = [
      <DropdownItem
        key='customer_support'
        href='https://access.redhat.com/support'
        target='_blank'
      >
        <Trans>
          Customer Support <ExternalLinkAltIcon />
        </Trans>
      </DropdownItem>,
      <DropdownItem
        key='training'
        href='https://www.ansible.com/resources/webinars-training'
        target='_blank'
      >
        <Trans>
          Training <ExternalLinkAltIcon />
        </Trans>
      </DropdownItem>,
      <DropdownItem key='about' onClick={() => setAboutModalVisible(true)}>
        {t`About`}
      </DropdownItem>,
    ];

    aboutModal = (
      <AboutModalWindow
        isOpen={aboutModalVisible}
        trademark=''
        brandImageSrc={Logo}
        onClose={() => setAboutModalVisible(false)}
        brandImageAlt={t`Galaxy Logo`}
        productName={APPLICATION_NAME}
        user={user}
        userName={userName}
      ></AboutModalWindow>
    );
  }

  const Header = (
    <PageHeader
      logo={<SmallLogo alt={APPLICATION_NAME}></SmallLogo>}
      logoComponent={({ children }) => (
        <Link to={formatPath(Paths.collections)}>{children}</Link>
      )}
      headerTools={
        <PageHeaderTools>
          {!user || user.is_anonymous ? (
            <LoginLink next={location.pathname} />
          ) : (
            <div>
              <StatefulDropdown
                ariaLabel={'docs-dropdown'}
                defaultText={<QuestionCircleIcon />}
                items={docsDropdownItems}
                toggleType='icon'
              />
              <StatefulDropdown
                ariaLabel={'user-dropdown'}
                defaultText={userName}
                items={userDropdownItems}
                toggleType='dropdown'
              />
            </div>
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
