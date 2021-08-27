
import React from "react";
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { Redirect } from 'react-router-dom';
import { EUIResourcePaths } from "../utils/Globals";


export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => (props: P): JSX.Element => {

  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);

  return (
    <React.Fragment>
      { !authContext.isLoggedIn && <Redirect to={EUIResourcePaths.Login} /> }
      { authContext.isLoggedIn && <Component {...props} /> }
    </React.Fragment>
  );
}
