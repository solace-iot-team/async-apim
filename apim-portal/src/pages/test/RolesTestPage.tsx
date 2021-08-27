import React from 'react';
import { AuthContext } from '../../components/AuthContextProvider/AuthContextProvider';
import { UserContext } from '../../components/UserContextProvider/UserContextProvider';

export const RolesTestPage: React.FC = () => {

  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  return (
    <React.Fragment>
        <h1>Roles Test Page</h1>
        <hr />
        <h5>authContext:</h5>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(authContext, null, 2)}
        </pre>
        <h5>userContext:</h5>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(userContext, null, 2)}
        </pre>
    </React.Fragment>
);

}

