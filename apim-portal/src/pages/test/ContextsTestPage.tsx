import React from 'react';
import { AuthContext } from '../../components/AuthContextProvider/AuthContextProvider';
import { ConfigContext } from '../../components/ConfigContextProvider/ConfigContextProvider';
import { UserContext } from '../../components/UserContextProvider/UserContextProvider';

export const ContextsTestPage: React.FC = () => {

  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);

  return (
    <React.Fragment>
      <h1>Contexts Test Page</h1>
      <hr />
      <h5>authContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(authContext, null, 2)}
      </pre>
      <h5>userContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(userContext, null, 2)}
      </pre>
      <h5>configContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(configContext, null, 2)}
      </pre>
    </React.Fragment>
);

}

