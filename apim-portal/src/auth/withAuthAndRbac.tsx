
import React from "react";
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { AuthHelper } from "./AuthHelper";
import { Redirect } from 'react-router-dom';
import { EUIResourcePaths } from "../utils/Globals";

export interface WithAuthRbacOptions {
  resourcePath: string;
}

export const withAuthAndRbac = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthRbacOptions
): React.FC<P> => (props: P): JSX.Element => {

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);

  const isAuthorized: boolean = AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, options.resourcePath);

  return (
    <React.Fragment>
      { !authContext.isLoggedIn && <Redirect to={EUIResourcePaths.Login} /> }
      { authContext.isLoggedIn && !isAuthorized && <Redirect to={EUIResourcePaths.Unauthorized} /> }
      { authContext.isLoggedIn && isAuthorized && <Component {...props} /> }
    </React.Fragment>
  );
}
