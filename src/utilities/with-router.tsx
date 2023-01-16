import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Paths } from 'src/paths';

// compatibility layer between react-router v6 and class components

// differences from v5:
// history.push -> navigate
// location -> location
// match.params -> routeParams
// match.path -> routePath

export class RouteProps {
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  routeParams: Record<string, string>;
  routePath: Paths;
}

export const withRouter = (ClassComponent) => {
  const WithRouter = ({ path }: { path: string }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
      <ClassComponent
        location={location}
        navigate={navigate}
        routeParams={params}
        routePath={path}
      />
    );
  };
  WithRouter.displayName = `withRouter(${
    ClassComponent.displayName || ClassComponent.name
  })`;

  return WithRouter;
};
