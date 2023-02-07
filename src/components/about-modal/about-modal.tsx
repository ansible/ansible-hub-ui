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
import * as React from 'react';
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

interface IState {
  applicationInfo: { server_version: string; pulp_ansible_version: string };
}

export class AboutModalWindow extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      applicationInfo: { server_version: '', pulp_ansible_version: '' },
    };
  }

  componentDidMount() {
    ApplicationInfoAPI.get('').then((result) => {
      this.setState({
        applicationInfo: {
          server_version: result.data.server_version,
          pulp_ansible_version: result.data.pulp_ansible_version,
        },
      });
    });
  }

  render() {
    const { isOpen, onClose, brandImageAlt, productName, user, userName } =
      this.props;
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
            <Value>{this.state.applicationInfo.server_version}</Value>

            <Label>{t`Pulp Ansible Version`}</Label>
            <Value>{this.state.applicationInfo.pulp_ansible_version}</Value>

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
  }
}
