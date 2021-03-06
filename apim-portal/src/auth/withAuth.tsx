
import React from "react";
import { Redirect } from 'react-router-dom';

import { EUICommonResourcePaths } from "../utils/Globals";
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => (props: P): JSX.Element => {

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);

  return (
    <React.Fragment>
      {/* { !authContext.isLoggedIn && <Redirect to={EUICommonResourcePaths.deleteme_Login} /> } */}
      { !authContext.isLoggedIn && <Redirect to={EUICommonResourcePaths.SecLogin} /> }
      { authContext.isLoggedIn && <Component {...props} /> }
    </React.Fragment>
  );
}
