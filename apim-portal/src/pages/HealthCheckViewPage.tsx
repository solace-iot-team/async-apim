import React from 'react';
import { useHistory } from 'react-router-dom';

import { APHealthCheckContext } from '../components/APHealthCheckContextProvider';
import { AuthContext } from '../components/APContextProviders//AuthContextProvider';
import { ConfigContext } from '../components/APContextProviders/ConfigContextProvider/ConfigContextProvider';
import { DisplaySystemHealthInfo } from '../components/SystemHealth/DisplaySystemHealthInfo';
import { UserContext } from '../components/APContextProviders/APUserContextProvider';
import { EAPHealthCheckSuccess, TAPHealthCheckSummary } from '../utils/APHealthCheck';
import { EAppState, EUICommonResourcePaths, Globals } from '../utils/Globals';

export const HealthCheckViewPage: React.FC = () => {
  const componentName = 'HealthCheckViewPage';

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [configContext] = React.useContext(ConfigContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [originAppState, setOriginAppState] = React.useState<EAppState>(userContext.originAppState);
  /* eslint-eanble @typescript-eslint/no-unused-vars */
  const history = useHistory();

  const navigateTo = (path: string): void => {
    history.push(path);
  }
  const navigateToOriginHome = (): void => {
    if(originAppState !== EAppState.UNDEFINED) navigateTo(Globals.getOriginHomePath(originAppState));
    else navigateTo(EUICommonResourcePaths.Home);
  }

  React.useEffect(() => {
    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(healthCheckContext.systemHealthCheckSummary && healthCheckContext.systemHealthCheckSummary.success !== EAPHealthCheckSuccess.FAIL) {
      navigateToOriginHome();
    }
  }, [healthCheckContext]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const getHeader = (): JSX.Element => {
    const funcName: string = 'getHeader';
    const logName: string = `${componentName}.${funcName}()`;
    if(!healthCheckContext.systemHealthCheckSummary) throw new Error(`${logName}: healthCheckContext.systemHealthCheckSummary is undefined`);
    const summary: TAPHealthCheckSummary = { ...healthCheckContext.systemHealthCheckSummary };
    if(!summary.performed) 
      return (<span style={{color: 'gray'}}>System Availability: unknown</span>);
    switch(summary.success) {
      case EAPHealthCheckSuccess.PASS:
        return (<span style={{color: 'green'}}>System Availability</span>);
      case EAPHealthCheckSuccess.PASS_WITH_ISSUES:
        return (<span style={{color: 'orange'}}>System Availability</span>);
      case EAPHealthCheckSuccess.FAIL:
        return (<span style={{color: 'red'}}>System Unavailable</span>);
      case EAPHealthCheckSuccess.UNDEFINED:
        return (<span style={{color: 'gray'}}>System Availability: unknown</span>);
      default:
        Globals.assertNever(logName, summary.success);
    }
    return (<></>);
  }

  const renderContent = () => {
    if(!healthCheckContext.systemHealthCheckSummary) return (<></>);
    return (
      <React.Fragment>
        <hr />
        <h1 style={{fontSize: 'xx-large'}}>{getHeader()}</h1>
        <hr />
        <DisplaySystemHealthInfo 
          healthCheckContext={healthCheckContext}
          connectorDisplayName={configContext.connector ? configContext.connector.displayName : '----unknown'}
        />
        {/* DEBUG */}
        {/* <hr />
        <h1>healthCheckContext:</h1>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(healthCheckContext, null, 2)}
        </pre> */}
        {/* <hr />
        <h1>healthCheckContext.connectorHealthCheckResult:</h1>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(healthCheckContext.connectorHealthCheckResult, null, 2)}
        </pre> */}
    </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {renderContent()}
    </React.Fragment>
  );
}
