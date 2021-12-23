import React from 'react';
import { useHistory } from 'react-router-dom';

import { Divider } from 'primereact/divider';

import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { AuthContext } from '../../components/AuthContextProvider/AuthContextProvider';
import { DisplaySystemHealthInfo } from '../../components/SystemHealth/DisplaySystemHealthInfo';
import { EAPHealthCheckSuccess, TAPHealthCheckSummary } from '../../utils/APHealthCheck';
import { EUIDeveloperPortalResourcePaths, Globals } from '../../utils/Globals';

export const DeveloperPortalHealthCheckViewPage: React.FC = () => {
  const componentName = 'DeveloperPortalHealthCheckViewPage';

  const [healthCheckContext] = React.useContext(APHealthCheckContext);
  const [authContext] = React.useContext(AuthContext);

  const history = useHistory();

  const navigateTo = (path: string): void => {
    history.push(path);
  }
  const navigateToHome = (): void => {
    if(authContext.isLoggedIn) navigateTo(EUIDeveloperPortalResourcePaths.UserHome);
    else navigateTo(EUIDeveloperPortalResourcePaths.Home);
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
    let text: string = 'Developer Portal Availability';
    const summary: TAPHealthCheckSummary = { ...healthCheckContext.connectorHealthCheckResult.summary };
    if(!summary.performed) {
      color = 'gray';
      text = 'Developer Portal Availability';
    } else {
      switch(summary.success) {
        case EAPHealthCheckSuccess.PASS:
          color = 'green';
          text = 'Developer Portal Availability';
          break;
        case EAPHealthCheckSuccess.PASS_WITH_ISSUES:
          color = 'organge';
          text = 'Developer Portal Availability';
          break;
        case EAPHealthCheckSuccess.FAIL:
          color = 'red';
          text = 'Developer Portal Unavailable';
          break;
        case EAPHealthCheckSuccess.UNDEFINED:
          color = 'gray';
          text = 'Developer Portal Availability: unknown';
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
        <DisplaySystemHealthInfo />
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
