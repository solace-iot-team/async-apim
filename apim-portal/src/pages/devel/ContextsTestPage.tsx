import React from 'react';
import { OrganizationContext } from '../../components/APContextProviders/APOrganizationContextProvider';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { AuthContext } from '../../components/APContextProviders/AuthContextProvider';
import { ConfigContext } from '../../components/APContextProviders/ConfigContextProvider/ConfigContextProvider';
import { UserContext } from '../../components/APContextProviders/APUserContextProvider';
import { SessionContext } from '../../components/APContextProviders/APSessionContextProvider';

export const ContextsTestPage: React.FC = () => {

  const [authContext] = React.useContext(AuthContext);
  const [userContext] = React.useContext(UserContext);
  const [organizationContext] = React.useContext(OrganizationContext);
  const [configContext] = React.useContext(ConfigContext);
  const [sessionContext] = React.useContext(SessionContext);
  const [healthCheckContext] = React.useContext(APHealthCheckContext);

  return (
    <React.Fragment>
      <h1>Contexts Test Page</h1>
      <hr />
      <h5>sessionContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(sessionContext, null, 2)}
      </pre>
      <hr />
      <h5>authContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(authContext, null, 2)}
        {JSON.stringify(authContext.authorizedResourcePathsAsString.split(','), null, 2)}
      </pre>
      <h5>organizationContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(organizationContext, null, 2)}
      </pre>
      <h5>userContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(userContext, null, 2)}
      </pre>
      <h5>configContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(configContext, null, 2)}
      </pre>
      <h5>healthCheckContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(healthCheckContext, null, 2)}
      </pre>
    </React.Fragment>
);

}

