import * as React from 'react';
import {
  AboutModal,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import Logo from 'src/../static/images/logo_large.svg';
import { ApplicationInfoAPI, UserType } from 'src/api';
import { detect } from 'detect-browser';

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
            <TextListItem component={TextListItemVariants.dt}>
              {t`Server version`}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {this.state.applicationInfo.server_version}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {t`Pulp Ansible Version`}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {this.state.applicationInfo.pulp_ansible_version}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {t`Username`}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {userName}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {t`User Groups`}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {user.groups.map((group) => group.name).join()}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {t`Browser Version`}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {browser.name + ' ' + browser.version}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {t`Browser OS`}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {browser.os}
            </TextListItem>
          </TextList>
        </TextContent>
      </AboutModal>
    );
  }
}
