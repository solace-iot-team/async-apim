import React from 'react';
import { useHistory } from 'react-router-dom';

import { Divider } from 'primereact/divider';

import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { AuthContext } from '../../components/APContextProviders/AuthContextProvider';
import { DisplaySystemHealthInfo } from '../../components/SystemHealth/DisplaySystemHealthInfo';
import { EAPHealthCheckSuccess, TAPHealthCheckSummary } from '../../utils/APHealthCheck';
import { EUIAdminPortalResourcePaths, Globals } from '../../utils/Globals';
import { ConfigContext } from '../../components/APContextProviders/ConfigContextProvider/ConfigContextProvider';

export const AdminPortalHealthCheckViewPage: React.FC = () => {
  const componentName = 'AdminPortalHealthCheckViewPage';

  const [configContext] = React.useContext(ConfigContext);
  const [healthCheckContext] = React.useContext(APHealthCheckContext);
  const [authContext] = React.useContext(AuthContext);

  const history = useHistory();

  const navigateTo = (path: string): void => {
    history.push(path);
  }
  const navigateToHome = (): void => {
    if(authContext.isLoggedIn) navigateTo(EUIAdminPortalResourcePaths.UserHome);
    else navigateTo(EUIAdminPortalResourcePaths.Home);
  }

  React.useEffect(() => {
    if(healthCheckContext.connectorHealthCheckResult && healthCheckContext.connectorHealthCheckResult.summary.success !== EAPHealthCheckSuccess.FAIL) {
      navigateToHome();
    }
  }, [healthCheckContext]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const getHeader = (): JSX.Element => {
    const funcName: string = 'getHeader';
    const logName: string = `${componentName}.${funcName}()`;
    if(!healthCheckContext.connectorHealthCheckResult) throw new Error(`${logName}: healthCheckContext.connectorHealthCheckResult is undefined`);
    let color: string = 'gray';
    let text: string = 'Admin Portal Availability';
    const summary: TAPHealthCheckSummary = { ...healthCheckContext.connectorHealthCheckResult.summary };
    if(!summary.performed) {
      color = 'gray';
      text = 'Admin Portal Availability';
    } else {
      switch(summary.success) {
        case EAPHealthCheckSuccess.PASS:
          color = 'green';
          text = 'Admin Portal Availability';
          break;
        case EAPHealthCheckSuccess.PASS_WITH_ISSUES:
          color = 'organge';
          text = 'Admin Portal Availability';
          break;
        case EAPHealthCheckSuccess.FAIL:
          color = 'red';
          text = 'Admin Portal Availability: Restricted';
          break;
        case EAPHealthCheckSuccess.UNDEFINED:
          color = 'gray';
          text = 'Admin Portal Availability: unknown';
          break;
        default:
          Globals.assertNever(logName, summary.success);
      }  
    }
    return (<span style={{fontSize: 'xx-large', color: color}}>{text}</span>);
  }

  const renderContent = () => {
    if(!healthCheckContext.connectorHealthCheckResult) return (<></>);
    return (
      <React.Fragment>
        <div className='p-my-4'>{getHeader()}</div>
        <Divider className='p-mb-4'/>
        <DisplaySystemHealthInfo 
          healthCheckContext={healthCheckContext}
          connectorDisplayName={configContext.connector ? configContext.connector.displayName : 'unknown'}
        />
        {/* <hr />
        <h1>Health Check:</h1>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(healthCheckContext, null, 2)}
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
