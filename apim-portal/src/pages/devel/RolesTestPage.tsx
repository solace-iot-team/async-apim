import React from 'react';
import { AuthContext } from '../../components/APContextProviders/AuthContextProvider';
import { UserContext } from '../../components/APContextProviders/APUserContextProvider';

export const RolesTestPage: React.FC = () => {

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-eanble @typescript-eslint/no-unused-vars */

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

