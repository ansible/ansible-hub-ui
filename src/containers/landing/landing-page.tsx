import { t } from '@lingui/macro';
import * as React from 'react';
import {
  AlertList,
  AlertType,
  BaseHeader,
  LandingPageCard,
  Main,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { RouteProps, withRouter } from 'src/utilities';

interface IState {
  alerts: AlertType[];
}

export class LandingPage extends React.Component<RouteProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      alerts: [],
    };
  }

  render() {
    const { alerts } = this.state;

    return (
      <React.Fragment>
        <AlertList
          alerts={alerts}
          closeAlert={(i) => this.closeAlert(i)}
        ></AlertList>
        <BaseHeader title={t`Home`} />
        <Main>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              marginLeft: '-24px',
            }}
          >
            <LandingPageCard
              title={t`Download`}
              body={<React.Fragment><p>{t`Jump-start your automation project with great content from the Ansible community. Galaxy provides pre-packaged units of work known to Ansible as roles and collections.`}</p><br/>

<p>{t`Content from roles and collections can be referenced in Ansible PlayBooks and immediately put to work. You'll find content for provisioning infrastructure, deploying applications, and all of the tasks you do everyday.`} </p><br/>

<p>{t`Use the <Search page> to find content for your project, then download them onto your Ansible host using <ansible-galaxy>, the command line tool that comes bundled with Ansible.`}</p></React.Fragment>}


            />
             <LandingPageCard
              title={t`Share`}
              body={<React.Fragment><p>{t`Help other Ansible users by sharing the awesome roles and collections you create.`}</p><br/>
              <p>{t`Maybe you have automation for installing and configuring a popular software package, or for deploying software built by your company. Whatever it is, use Galaxy to share it with the community.`}</p><br/>


<p>{t`Red Hat is working on exciting new Ansible content development capabilities within the context of <Project Wisdom> to help other automators build Ansible content. Your roles and collections may be used as training data for a machine learning model that provides Ansible automation content recommendations. If you have concerns, please contact the Ansible team at <ansible-content-ai@redhat.com>.`}</p></React.Fragment>}


            />
             <LandingPageCard
              title={t`Featured`}
              body={<React.Fragment><p>{t`Jump-start your automation project with great content from the Ansible community. Galaxy provides pre-packaged units of work known to Ansible as roles and collections.`}</p><br/>

<p>{t`Content from roles and collections can be referenced in Ansible PlayBooks and immediately put to work. You'll find content for provisioning infrastructure, deploying applications, and all of the tasks you do everyday.`} </p><br/>
<p>{t`Use the Search page to find content for your project, then download them onto your Ansible host using ansible-galaxy, the command line tool that comes bundled with Ansible.`}</p></React.Fragment>}
            />
          </div>
        </Main>
      </React.Fragment>
    );
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private addAlert(alert: AlertType) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }
}

export default withRouter(LandingPage);

LandingPage.contextType = AppContext;
