
import React from "react";
import { Redirect } from 'react-router-dom';

import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { EUIResourcePaths } from "../utils/Globals";


export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => (props: P): JSX.Element => {

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);

  return (
    <React.Fragment>
      { !authContext.isLoggedIn && <Redirect to={EUIResourcePaths.Login} /> }
      { authContext.isLoggedIn && <Component {...props} /> }
    </React.Fragment>
  );
}
