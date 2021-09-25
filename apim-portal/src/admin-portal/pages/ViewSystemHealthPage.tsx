import React from 'react';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { ConfigContext } from '../../components/ConfigContextProvider/ConfigContextProvider';

export const ViewSystemHealthPage: React.FC = () => {

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  /* eslint-eanble @typescript-eslint/no-unused-vars */

  return (
    <React.Fragment>
      <hr />
      <h1>ViewSystemHealthPage</h1>
      <hr />
      <h5>healthCheckContext:</h5>
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(healthCheckContext, null, 2)}
      </pre>
      <hr />
      <h5>configContext:</h5>
      <pre style={ { fontSize: '10px' }} >
        {JSON.stringify(configContext, null, 2)}
      </pre>
    </React.Fragment>
  );
}
