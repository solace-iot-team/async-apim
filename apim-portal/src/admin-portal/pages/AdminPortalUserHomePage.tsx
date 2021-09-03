import React from 'react';
import { UserContext } from '../../components/UserContextProvider/UserContextProvider';

export const AdminPortalUserHomePage: React.FC = () => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  return (
    <React.Fragment>
      <h1>Welcome to AdminPortalUserHomePage</h1>
      <hr />
      <h3>Hello {userContext.user.profile?.first} {userContext.user.profile?.last}.</h3>
    </React.Fragment>
  );
}

