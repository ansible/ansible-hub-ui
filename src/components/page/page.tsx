import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionType } from 'src/actions';
import { LoadingPageSpinner } from 'src/components';
import {
  AlertList,
  AlertType,
  BaseHeader,
  Breadcrumbs,
  EmptyStateUnauthorized,
  Main,
  closeAlert,
} from 'src/components';
import { useContext } from 'src/loaders/app-context';
import { PermissionContextType } from 'src/permissions';
import { FunctionRouteProps, errorMessage } from 'src/utilities';

// states:
// loading - initial state, only Main + spinner, header and alerts
// unauthorized - only EmptyStateUnauthorized, header and alerts
// (data) - renders detail

interface PageProps<T> extends FunctionRouteProps {
  breadcrumbs: ({ name }) => { url?: string; name: string }[];
  condition: PermissionContextType;
  didMount?: ({ context, addAlert }) => void;
  displayName: string;
  errorTitle: string;
  headerActions?: ActionType[];
  query: ({ name }) => Promise<T>;
  title: ({ name }) => string;
  transformParams: (routeParams) => Record<string, string>;
  render: (item, actionContext) => React.ReactNode;
}

export const Page = function <
  T extends { name: string; my_permissions?: string[] },
>({
  // ({ name }) => [{ url?, name }]
  breadcrumbs,
  // { featureFlags, settings, user } => bool
  condition,
  // extra code to run on mount
  didMount,
  // component name for debugging
  displayName,
  // alert on query failure
  errorTitle,
  // displayed after filters
  headerActions,
  // () => Promise<T>
  query: propsQuery,
  title,
  transformParams,
  render,
}: // path,
PageProps<T>) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [item, setItem] = useState<T>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unauthorized, setUnauthorized] = useState<boolean>(false);

  const context = useContext();
  const routeParams = useParams();
  const navigate = useNavigate();

  const addAlert = (alert: AlertType) =>
    setAlerts((alerts) => [...alerts, alert]);

  const setState = ({ alerts, item, loading, unauthorized }) => {
    if (alerts !== undefined) {
      setAlerts(alerts);
    }
    if (item !== undefined) {
      setItem(item);
    }
    if (loading !== undefined) {
      setLoading(loading);
    }
    if (unauthorized !== undefined) {
      setUnauthorized(unauthorized);
    }
  };

  const query = () => {
    const { name } = transformParams(routeParams);

    if (!name) {
      setLoading(false);
      return;
    }

    setLoading(true);
    propsQuery({ name })
      .then((item) => {
        setItem(item);
        setLoading(false);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        setItem(null);
        setLoading(false);
        addAlert({
          title: errorTitle,
          variant: 'danger',
          description: errorMessage(status, statusText),
        });
      });
  };

  const renderModals = (actionContext) => (
    <>
      {headerActions?.length
        ? headerActions.map((action) => action?.modal?.(actionContext))
        : null}
    </>
  );

  useEffect(() => {
    if (!condition(context)) {
      setLoading(false);
      setUnauthorized(true);
    } else {
      query();
    }

    setAlerts(context.alerts || []);
    context.setAlerts([]);

    if (didMount) {
      didMount({
        context,
        addAlert,
      });
    }
  }, []);

  const actionContext = {
    addAlert,
    hasObjectPermission: (permission) =>
      item?.my_permissions?.includes?.(permission),
    hasPermission: context.hasPermission,
    navigate,
    query,
    queueAlert: context.queueAlert,
    user: context.user,
    setState,
    state: { alerts, item, loading, unauthorized },
  };

  const name = item?.name || transformParams(routeParams)?.name || null;

  return (
    <>
      <AlertList
        alerts={alerts}
        closeAlert={(i) => closeAlert(i, { alerts, setAlerts })}
      ></AlertList>
      <BaseHeader
        title={title({ name })}
        breadcrumbs={
          <Breadcrumbs
            links={breadcrumbs({
              name,
            })}
          />
        }
        pageControls={
          <div className='hub-list-toolbar'>
            <Toolbar>
              <ToolbarContent>
                <ToolbarGroup>
                  {headerActions?.length &&
                    headerActions.map((action) => (
                      <ToolbarItem key={action.title}>
                        {action.button(item, actionContext)}
                      </ToolbarItem>
                    ))}
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
          </div>
        }
      />
      {renderModals?.(actionContext)}
      {unauthorized ? (
        <EmptyStateUnauthorized />
      ) : (
        <Main>
          {loading ? (
            <LoadingPageSpinner />
          ) : (
            <section className='body' data-cy={`Page-${displayName}`}>
              {render(item, actionContext)}
            </section>
          )}
        </Main>
      )}
    </>
  );
};
