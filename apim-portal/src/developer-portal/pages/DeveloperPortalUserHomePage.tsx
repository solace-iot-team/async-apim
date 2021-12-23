import React from 'react';
import { UserContext } from '../../components/UserContextProvider/UserContextProvider';

export const DeveloperPortalUserHomePage: React.FC = () => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  return (
    <React.Fragment>
      <h1 style={{fontSize: 'xx-large'}}>Welcome to the Async API Developer Portal</h1>
      <hr />
      <div className='p-mt-4'>Hello {userContext.user.profile?.first} {userContext.user.profile?.last}.</div>
    </React.Fragment>
  );
}

