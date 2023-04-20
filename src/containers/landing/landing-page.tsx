import { t } from '@lingui/macro';
import { Title } from '@patternfly/react-core';
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
        <BaseHeader title={t`Welcome to Beta Galaxy`} />
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
              body={
                <React.Fragment>
                  <p>{t`Jump-start your automation project with great content from the Ansible community. Galaxy provides pre-packaged units of work known to Ansible as roles and collections.`}</p>
                  <br />

                  <p>
                    {t`Content from roles and collections can be referenced in Ansible PlayBooks and immediately put to work. You'll find content for provisioning infrastructure, deploying applications, and all of the tasks you do everyday.`}{' '}
                  </p>
                  <br />

                  <p>
                    {t`Use the`}{' '}
                    <a href='https://galaxy.ansible.com/search?deprecated=false&keywords=&order_by=-relevance'>{t`Search page`}</a>{' '}
                    {t`to find content for your project, then download them onto your Ansible host using`}{' '}
                    <a
                      href='https://docs.ansible.com/ansible/latest/reference_appendices/galaxy.html#the-command-line-tool'
                      target='_blanck'
                    >{t`ansible-galaxy`}</a>
                    {t`, the command line tool that comes bundled with Ansible.`}
                  </p>
                </React.Fragment>
              }
            />
            <LandingPageCard
              title={t`Share`}
              body={
                <React.Fragment>
                  <p>{t`Help other Ansible users by sharing the awesome roles and collections you create.`}</p>
                  <br />
                  <p>{t`Maybe you have automation for installing and configuring a popular software package, or for deploying software built by your company. Whatever it is, use Galaxy to share it with the community.`}</p>
                  <br />

                  <p>
                    {t`Red Hat is working on exciting new Ansible content development capabilities within the context of`}{' '}
                    <a
                      href='https://www.redhat.com/en/engage/project-wisdom?extIdCarryOver=true&sc_cid=701f2000001OH6uAAG'
                      target='_blank'
                      rel='noopener noreferrer'
                    >{t`Project Wisdom`}</a>{' '}
                    {t`to help other automators build Ansible content. Your roles and collections may be used as training data for a machine learning model that provides Ansible automation content recommendations. If you have concerns, please contact the Ansible team at`}{' '}
                    <a href='mailto:ansible-content-ai@redhat.com'>{t`ansible-content-ai@redhat.com`}</a>
                  </p>
                </React.Fragment>
              }
            />
            <LandingPageCard
              title={t`Featured`}
              body={
                <React.Fragment>
                  <b>
                    <p>{t`AnsibleFest`}</p>
                  </b>
                  <br />
                  <p>
                    <a href='https://www.redhat.com/en/summit/ansiblefest?intcmp=7013a0000034lvmAAA'>
                      <img
                        width='100%'
                        alt='Ansible Fest at Red Hat Summit May 23rd to 25th 2023'
                        src='https://www.ansible.com/hubfs/rh-2023-summit-ansiblefest-ansible-galaxy-site-200x200.png'
                      />
                    </a>
                  </p>
                  <hr
                    style={{
                      boxSizing: 'content-box',
                      height: 0,
                      marginTop: 20,
                      marginBottom: 20,
                      border: 0,
                      borderTop: '1px solid #f1f1f1',
                    }}
                  />
                  <p>
                    <b>
                      {t`Extend the power of Ansible to your entire team.`}{' '}
                    </b>
                  </p>
                  <br />
                  <p>{t`Try Red Hat Ansible Automation Platform`}</p>
                  <br />
                  <p>
                    <a
                      href='https://www.redhat.com/en/technologies/management/ansible/try-it?sc_cid=7013a0000030vCCAAY'
                      target='_blank'
                      rel='noreferrer'
                    >{t`Get the trial`}</a>
                  </p>
                </React.Fragment>
              }
            />
            <LandingPageCard
              title={t`Terms of Use`}
              body={
                <React.Fragment>
                  <div style={{ display: 'flex',}}>
                  <p style={{paddingRight: '16px'}}>
                    <a href='https://www.redhat.com/en/about/privacy-policy'>{t`Privacy statement`}</a>
                  </p>
                  <p style={{paddingRight: '16px'}}><a href='https://www.redhat.com/en/about/terms-use'>{t`Terms of use`}</a></p>
                  <p style={{paddingRight: '16px'}}><a href='https://www.redhat.com/en/about/all-policies-guidelines'>{t`All policies and guidelines`}</a></p>
                  <p style={{paddingRight: '16px'}}><a href='https://www.redhat.com/en/about/digital-accessibility'>{t`Digital accessibility`}</a></p>
                  <p style={{paddingRight: '16px'}}><a href="#">{t`Cookie preferences`}</a></p>
                  </div>
                </React.Fragment>
              }
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
