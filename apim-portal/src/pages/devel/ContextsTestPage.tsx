import React from 'react';
import { OrganizationContext } from '../../components/APContextProviders/APOrganizationContextProvider';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { AuthContext } from '../../components/AuthContextProvider/AuthContextProvider';
import { ConfigContext } from '../../components/ConfigContextProvider/ConfigContextProvider';
import { UserContext } from '../../components/APContextProviders/APUserContextProvider';

export const ContextsTestPage: React.FC = () => {

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  /* eslint-eanble @typescript-eslint/no-unused-vars */

  return (
    <React.Fragment>
      <h1>Contexts Test Page</h1>
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

