import React from 'react';
import { UserContext } from '../components/UserContextProvider/UserContextProvider';

export const UserHomePage: React.FC = () => {

  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  return (
    <React.Fragment>
      <h1>Welcome to the AsyncAPI Admin Portal</h1>
      <hr />
      <h3>Hello {userContext.user.profile?.first} {userContext.user.profile?.last}.</h3>
    </React.Fragment>
  );
}

