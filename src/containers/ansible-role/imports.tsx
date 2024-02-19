import { t } from '@lingui/macro';
import React, { Component, createRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LegacyImportAPI,
  LegacyRoleAPI,
  LegacyRoleImportDetailType,
} from 'src/api';
import {
  AlertList,
  AlertType,
  BaseHeader,
  ImportConsole,
  Main,
  RoleImportList,
  closeAlertMixin,
} from 'src/components';
import { Paths, formatPath } from 'src/paths';
import { ParamHelper, RouteProps, withRouter } from 'src/utilities';

interface IState {
  alerts: AlertType[];
  error;
  followLogs: boolean;
  params;
  role;
  selectedImport: LegacyRoleImportDetailType;
}

const RoleLink = ({ role_id }: { role_id?: number }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!role_id) {
      setRole(null);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LegacyRoleAPI.get(role_id as any).then(
      ({
        data: {
          name,
          summary_fields: {
            namespace: { name: namespace },
          },
        },
      }) => setRole({ namespace, name }),
    );
  }, [role_id]);

  if (!role) {
    return null;
  }

  const { namespace, name } = role;

  return (
    <div
      style={{
        fontSize: '18px',
        padding: '10px 10px 0 10px',
      }}
    >
      {!role ? (
        `${namespace}.${name}`
      ) : (
        <Link
          to={formatPath(Paths.standaloneRole, {
            namespace,
            name,
          })}
        >
          {namespace}.{name}
        </Link>
      )}
    </div>
  );
};

class AnsibleRoleImports extends Component<RouteProps, IState> {
  polling: ReturnType<typeof setInterval>;
  topOfPage: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);

    const params = ParamHelper.parseParamString(props.location.search, [
      'page',
      'page_size',
    ]);

    this.topOfPage = createRef();

    this.state = {
      alerts: [],
      error: null,
      followLogs: false,
      params,
      role: null,
      selectedImport: null,
    };
  }

  componentDidMount() {
    this.polling = setInterval(() => {
      this.loadTaskDetails();
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.polling);
  }

  private get closeAlert() {
    return closeAlertMixin('alerts');
  }

  private addAlert(alert) {
    this.setState({
      alerts: [...this.state.alerts, alert],
    });
  }

  render() {
    const { alerts, error, followLogs, params, selectedImport } = this.state;

    return (
      <>
        <div ref={this.topOfPage} />
        <BaseHeader title={t`Role imports`} />
        <AlertList alerts={alerts} closeAlert={(i) => this.closeAlert(i)} />
        <Main>
          <section className='body'>
            <div style={{ display: 'flex' }} data-cy='AnsibleRoleImports'>
              <div style={{ width: '400px' }}>
                <RoleImportList
                  addAlert={(alert) => this.addAlert(alert)}
                  params={params}
                  selectImport={(s) => this.selectImport(s)}
                  selectedImport={selectedImport}
                  updateParams={(params) => this.updateParams(params)}
                />
              </div>

              <div style={{ flexGrow: '1', marginLeft: '16px' }}>
                <RoleLink role_id={selectedImport?.role_id} />

                <ImportConsole
                  apiError={
                    error ? error : selectedImport ? null : `Select an import`
                  }
                  followMessages={followLogs}
                  roleImport={selectedImport}
                  setFollowMessages={(followLogs) =>
                    this.setState({ followLogs })
                  }
                />
              </div>
            </div>
          </section>
        </Main>
      </>
    );
  }

  private get updateParams() {
    return ParamHelper.updateParamsMixin();
  }

  private selectImport(selectedImport) {
    this.setState({ selectedImport }, () => this.loadTaskDetails());
    window.requestAnimationFrame(() =>
      this.topOfPage.current?.scrollIntoView({ behavior: 'smooth' }),
    );
  }

  private loadTaskDetails() {
    const { selectedImport } = this.state;

    if (!selectedImport) {
      return null;
    }

    if (!['RUNNING', 'WAITING'].includes(selectedImport.state)) {
      return;
    }

    this.setState({ error: null });
    return LegacyImportAPI.list({
      detail: true,
      page_size: 1,
      role_id: selectedImport.role_id,
      sort: '-created',
    })
      .then(
        ({
          data: {
            results: [first],
          },
        }) =>
          this.setState({
            error: null,
            selectedImport: first || selectedImport,
          }),
      )
      .catch(() =>
        this.setState({
          error: t`Error fetching import from API`,
          selectedImport: null,
        }),
      );
  }
}

export default withRouter(AnsibleRoleImports);
