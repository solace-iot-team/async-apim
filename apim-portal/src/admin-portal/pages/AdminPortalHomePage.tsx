import React from 'react';
import { useLocation } from 'react-router-dom';

import { UserContext } from '../../components/UserContextProvider/UserContextProvider';
import { EAppState, TLocationStateAppState } from '../../utils/Globals';

export const AdminPortalHomePage: React.FC = () => {

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const location = useLocation<TLocationStateAppState>();

  React.useEffect(() => {
    // only set app state if direct call to url
    if(!location.state || (location.state && location.state.setAppState)) {
      dispatchUserContextAction({ type: 'SET_ORIGIN_APP_STATE', appState: EAppState.ADMIN_PORTAL });
      dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: EAppState.UNDEFINED });
    }
  }, []);  /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <React.Fragment>
        <h1>Welcome to the AsyncAPI Admin Portal</h1>
        <hr />
    </React.Fragment>
  );
}

