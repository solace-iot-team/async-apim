import React from 'react';
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { UserContext } from '../components/UserContextProvider/UserContextProvider';

export const HomePage: React.FC = () => {

  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  return (
    <React.Fragment>
        <h1>Welcome to the AsyncAPI Admin Portal</h1>
        <hr />
    </React.Fragment>
);

}

