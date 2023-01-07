import React, { useLocation, useParams } from 'react';

// compatibility layer between react-router v6 and class components

export class RouteComponentProps {
  location: ReturnType<typeof useLocation>;
  routeParams: ReturnType<typeof useParams>;
}

export const withRouter = (ClassComponent) => {
  const WithRouter = (_props) => {
    const location = useLocation();
    const params = useParams();

    return <ClassComponent location={location} routeParams={params} />;
  };

  return WithRouter;
};
