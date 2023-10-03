import { Trans, t } from '@lingui/macro';
import { Alert } from '@patternfly/react-core';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertList,
  AlertType,
  BaseHeader,
  LandingPageCard,
  Main,
  MultiSearchSearch,
  closeAlertMixin,
} from 'src/components';
import { AppContext } from 'src/loaders/app-context';
import { Paths, formatPath } from 'src/paths';
import { RouteProps, withRouter } from 'src/utilities';
import './landing-page.scss';

interface IState {
  alerts: AlertType[];
  redirect: boolean;
}

export class LandingPage extends React.Component<RouteProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      alerts: [],
      redirect: false,
    };
  }

  componentDidMount() {
    const { ai_deny_index } = this.context.featureFlags;
    if (!ai_deny_index) {
      this.setState({ redirect: true });
    }
  }

  render() {
    const { alerts, redirect } = this.state;

    if (redirect) {
      setTimeout(() => this.props.navigate(formatPath(Paths.collections)));
      return null;
    }

    return (
      <React.Fragment>
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <BaseHeader title={t`Welcome to Galaxy`} />
        <Main>
          <MultiSearchSearch
            updateParams={({ keywords }) =>
              this.props.navigate(formatPath(Paths.search, {}, { keywords }))
            }
            style={{ marginBottom: '16px' }}
          />

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
                  <Alert
                    isInline
                    variant='warning'
                    title={t`To be able to download content from galaxy it is required to have ansible-core>=2.13.9`}
                  >
                    {t`Please, check it running the command:`}{' '}
                    <code>ansible --version</code>
                  </Alert>
                  <br />
                  <p>{t`Jump-start your automation project with great content from the Ansible community. Galaxy provides pre-packaged units of work known to Ansible as roles and collections.`}</p>
                  <br />
                  <p>
                    {t`Content from roles and collections can be referenced in Ansible PlayBooks and immediately put to work. You'll find content for provisioning infrastructure, deploying applications, and all of the tasks you do everyday.`}{' '}
                  </p>
                  <br />
                  <p>
                    <Trans>
                      Use the{' '}
                      <Link to={formatPath(Paths.collections)}>
                        Search page{' '}
                      </Link>
                      to find content for your project, then download them onto
                      your Ansible host using{' '}
                      <a
                        href='https://docs.ansible.com/ansible/latest/reference_appendices/galaxy.html#the-command-line-tool'
                        target='_blank'
                        rel='noreferrer'
                      >
                        ansible-galaxy
                      </a>
                      , the command line tool that comes bundled with Ansible.
                    </Trans>
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
                    <Trans>
                      Red Hat is working on exciting new Ansible content
                      development capabilities within the context of{' '}
                      <a
                        href='https://www.redhat.com/en/engage/project-wisdom?extIdCarryOver=true&sc_cid=701f2000001OH6uAAG'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Ansible Lightspeed
                      </a>{' '}
                      to help other automators build Ansible content. Your roles
                      and collections may be used as training data for a machine
                      learning model that provides Ansible automation content
                      recommendations. If you have concerns, please contact the
                      Ansible team at{' '}
                      <a href='mailto:ansible-content-ai@redhat.com'>
                        ansible-content-ai@redhat.com
                      </a>
                    </Trans>
                  </p>
                </React.Fragment>
              }
            />
            <LandingPageCard
              title={t`Featured`}
              body={
                <React.Fragment>
                  <b>
                    <p>{t`Ansible Lightspeed`}</p>
                  </b>
                  <br />
                  <p>
                    <a
                      href='https://redhat.com/ansible-lightspeed'
                      target='_blank'
                      rel='noreferrer'
                    >
                      <img
                        width='100%'
                        alt='Generative Ai, The Ansible way. Try Ansible Lightspeed with IBM watsonx Code Assistant'
                        src='/static/images/LightspeedGalaxyAd1.png'
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
                  <div className='footer-parent-links'>
                    <span>
                      <a
                        className='footer-link'
                        href='https://www.redhat.com/en/about/privacy-policy'
                        target='_blank'
                        rel='noreferrer'
                      >{t`Privacy statement`}</a>
                    </span>
                    <span>
                      <a
                        className='footer-link'
                        href='https://www.redhat.com/en/about/terms-use'
                        target='_blank'
                        rel='noreferrer'
                      >{t`Terms of use`}</a>
                    </span>
                    <span>
                      <a
                        className='footer-link'
                        href='https://www.redhat.com/en/about/all-policies-guidelines'
                        target='_blank'
                        rel='noreferrer'
                      >{t`All policies and guidelines`}</a>
                    </span>
                    <span>
                      <a
                        className='footer-link'
                        href='https://www.redhat.com/en/about/digital-accessibility'
                        target='_blank'
                        rel='noreferrer'
                      >{t`Digital accessibility`}</a>
                    </span>
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
