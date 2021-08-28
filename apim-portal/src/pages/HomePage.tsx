import React from 'react';
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { UserContext } from '../components/UserContextProvider/UserContextProvider';

export const HomePage: React.FC = () => {

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <React.Fragment>
        <h1>Welcome to the AsyncAPI Admin Portal</h1>
        <hr />
    </React.Fragment>
);

}

