
import React from "react";
import { useHistory } from 'react-router-dom';

import { UserContext } from "../UserContextProvider/UserContextProvider";
import { APHealthCheckSummaryContext } from "../APHealthCheckSummaryContextProvider";
import { 
  EAPHealthCheckSuccess, 
} from "../../utils/APHealthCheck";
import { 
  EAppState,
  EUIAdminPortalResourcePaths, 
  EUIDeveloperPortalResourcePaths, 
} from "../../utils/Globals";

import "../APComponents.css";
import "./SystemHealth.css";

export interface ICheckConnectorHealthProps {}

export const CheckConnectorHealth: React.FC<ICheckConnectorHealthProps> = (props: ICheckConnectorHealthProps) => {
  // const componentName = 'CheckConnectorHealth';

  const [userContext] = React.useContext(UserContext);
  const [healthCheckSummaryState] = React.useContext(APHealthCheckSummaryContext);
  const history = useHistory();

  const navigateTo = (path: string): void => {
    history.push(path);
  }

  React.useEffect(() => {
    if(healthCheckSummaryState.connectorHealthCheckSuccess === EAPHealthCheckSuccess.UNDEFINED) return;
    if(healthCheckSummaryState.connectorHealthCheckSuccess === EAPHealthCheckSuccess.FAIL) {
      if(userContext.currentAppState === EAppState.DEVELOPER_PORTAL) navigateTo(EUIDeveloperPortalResourcePaths.DeveloperPortalConnectorUnavailable);
      else if(userContext.currentAppState === EAppState.ADMIN_PORTAL) navigateTo(EUIAdminPortalResourcePaths.AdminPortalConnectorUnavailable);
    }
  }, [healthCheckSummaryState]);


  // const getHeader = (): JSX.Element => {
  //   const funcName: string = 'getHeader';
  //   const logName: string = `${componentName}.${funcName}()`;
  //   if(!healthCheckContext.connectorHealthCheckResult) throw new Error(`${logName}: healthCheckContext.connectorHealthCheckResult is undefined`);
  //   let color: string = 'gray';
  //   let text: string = 'Admin Portal Availability';
  //   const summary: TAPHealthCheckSummary = { ...healthCheckContext.connectorHealthCheckResult.summary };
  //   if(!summary.performed) {
  //     color = 'gray';
  //     text = 'Admin Portal Availability';
  //   } else {
  //     switch(summary.success) {
  //       case EAPHealthCheckSuccess.PASS:
  //         // return (<span style={{color: 'green'}}>Admin Portal Availability</span>);
  //         color = 'green';
  //         text = 'Admin Portal Availability';
  //         break;
  //       case EAPHealthCheckSuccess.PASS_WITH_ISSUES:
  //         color = 'organge';
  //         text = 'Admin Portal Availability';
  //         break;
  //         // return (<span style={{color: 'orange'}}>Admin Portal Availability</span>);
  //       case EAPHealthCheckSuccess.FAIL:
  //         color = 'red';
  //         text = 'Admin Portal Availability: Restricted';
  //         break;
  //         // return (<span style={{color: 'red'}}>Admin Portal Availability Restricted</span>);
  //       case EAPHealthCheckSuccess.UNDEFINED:
  //         color = 'gray';
  //         text = 'Admin Portal Availability: unknown';
  //         break;
  //         // return (<span style={{color: 'gray'}}>Admin Portal Availability: unknown</span>);
  //       default:
  //         Globals.assertNever(logName, summary.success);
  //     }  
  //   }
  //   return (<span style={{color: color}}>{text}</span>);
  //   // return (<span style={{fontSize: 'xx-large', color: color}}>{text}</span>);
  // }

  // const renderAdminPortalHealthCheckAlert = (): JSX.Element => {
    
  //   return (
  //     <Dialog
  //       className="p-fluid"
  //       visible={showDialog} 
  //       style={{ width: '700px' }} 
  //       header={getHeader()}
  //       modal
  //       closable={true}
  //       // footer={renderDeleteManagedObjectDialogFooter()}
  //       onHide={()=> { setShowDialog(false)}}
  //       position="top"
  //     >
  //       <DisplaySystemHealthInfo />
  //     </Dialog>
  //   );
  // }

  // const renderPortalHealthCheckView = (): JSX.Element => {
  //   if(!connectorHealthCheckResult.summary.performed) return (<></>);
  //   if(connectorHealthCheckResult.summary.success !== EAPHealthCheckSuccess.FAIL) return(<></>);
  //   // developer portal
  //   if(userContext.currentAppState === EAppState.DEVELOPER_PORTAL) navigateTo(EUIDeveloperPortalResourcePaths.DeveloperPortalConnectorUnavailable);
  //   // admin portal
  //   return renderAdminPortalHealthCheckAlert();
  // }
  
  // return (
  //   <React.Fragment>
  //     {renderPortalHealthCheckView()}
  //   </React.Fragment>
  // );
  return (<></>);
}
