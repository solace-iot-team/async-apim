
import React from "react";

import { Divider } from "primereact/divider";

import { 
  AppStatus,
  WebHookAuth,
  WebHookBasicAuth,
  WebHookHeaderAuth,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  TAPManagedAppWebhooks, 
  TAPManagedWebhook, 
  TAPWebhookStatus 
} from "../../../../components/APComponentsCommon";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { APRenderUtils } from "../../../../utils/APRenderUtils";
import { Globals } from "../../../../utils/Globals";
import { EWebhookAuthMethodSelectIdNone } from "./DeveloperPortalManageUserAppWebhooksCommon";
import { APDisplayAppWebhookStatus, EAPDisplayAppWebhookStatus_Content } from "../../../../components/APDisplayAppStatus/APDisplayAppWebhookStatus";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalViewUserAppWebhookProps {
  managedAppWebhooks: TAPManagedAppWebhooks;
  managedWebhook: TAPManagedWebhook;
}

export const DeveloperPortalViewUserAppWebhook: React.FC<IDeveloperPortalViewUserAppWebhookProps> = (props: IDeveloperPortalViewUserAppWebhookProps) => {
  const componentName = 'DeveloperPortalViewUserAppWebhook';

  type TManagedObjectDisplay = TAPManagedWebhook;

  const [managedObjectDisplay] = React.useState<TManagedObjectDisplay>(props.managedWebhook);

  const renderStatus = (managedWebhook: TAPManagedWebhook): JSX.Element => {
    const funcName = 'renderStatus';
    const logName = `${componentName}.${funcName}()`;
    const appStatus: AppStatus | undefined = managedWebhook.references.apiAppResponse.status;
    if(!appStatus) throw new Error(`${logName}: appStatus is undefined`);
    const webhookStatus: TAPWebhookStatus | undefined = managedWebhook.webhookStatus;
    let jsxSummaryStatus: JSX.Element; 
    let jsxDetails: JSX.Element | undefined = undefined;
    if(appStatus === AppStatus.PENDING) jsxSummaryStatus = (<span style={{ color: 'gray'}}>N/A (App is pending approval)</span>);
    else if(!webhookStatus) jsxSummaryStatus = (<span style={{ color: 'gray'}}>Unknown</span>);
    else {
      if(webhookStatus.summaryStatus) jsxSummaryStatus = (<span style={{ color: 'green'}}>Up</span>);
      else jsxSummaryStatus = (<span style={{ color: 'red'}}>Down</span>);
      if(!webhookStatus.summaryStatus) {
        jsxDetails = (
          <div className="p-ml-2">
            <div><b>Details</b>:</div>
            <APDisplayAppWebhookStatus
              apWebhookStatus={webhookStatus}
              displayContent={EAPDisplayAppWebhookStatus_Content.FAILURE_DETAILS_ONLY_IF_DOWN}
            />
          </div>
        );
      }
    }
    return (
      <React.Fragment>
        <div><b>Webhook Status</b>: {jsxSummaryStatus}</div>
        {jsxDetails}
      </React.Fragment>
    );
  }

  const renderAuthentication = (webHookAuth: WebHookAuth | undefined): JSX.Element => {
    const funcName = 'renderAuthentication';
    const logName = `${componentName}.${funcName}()`;
    const isDefined: boolean = (webHookAuth !== undefined);
    let jsxType: JSX.Element = (<span style={{ color: 'gray'}}>{EWebhookAuthMethodSelectIdNone.NONE}</span>);
    let jsxDetails: JSX.Element | undefined;
    if(isDefined) {
      if(!webHookAuth) throw new Error(`${logName}: webHookAuth is undefined`);
      if(!webHookAuth.authMethod) throw new Error(`${logName}: webHookAuth.authMethod is undefined`);
      switch(webHookAuth.authMethod) {
        case WebHookBasicAuth.authMethod.BASIC:
          jsxType = (<span>{WebHookBasicAuth.authMethod.BASIC}</span>);
          jsxDetails = (
            <div className="p-ml-2">
               <div><b>Username</b>: {webHookAuth.username}</div> 
               <div><b>Password</b>: {webHookAuth.password}</div> 
            </div>
          );
          break;
        case WebHookHeaderAuth.authMethod.HEADER:
          jsxType = (<span>{WebHookHeaderAuth.authMethod.HEADER}</span>);
          jsxDetails = (
            <div className="p-ml-2">
               <div><b>Header</b>: {webHookAuth.headerName}</div> 
               <div><b>Value</b>: {webHookAuth.headerValue}</div> 
            </div>
          );
          break;
        default:
          Globals.assertNever(logName, webHookAuth.authMethod);
      }
    }
    return (
      <React.Fragment>
        <div><b>Authentication</b>: {jsxType}</div>
        { isDefined && 
          <div className="p-ml-2">{jsxDetails}</div>
        }
      </React.Fragment>
    );
  }

  const renderTrustedCNs = (trustedCNList: Array<string> | undefined): JSX.Element => {
    const areDefined: boolean = (trustedCNList !== undefined && trustedCNList.length > 0);
    let jsxElem: JSX.Element;
    if(!areDefined) jsxElem  = (<span style={{ color: 'gray'}}>None defined.</span>);
    else jsxElem = APRenderUtils.renderStringListAsDivList(trustedCNList);
    return (
      <React.Fragment>
        <div><b>Trusted Common Names</b>: {!areDefined && jsxElem}</div>
        { areDefined && 
          <div className="p-ml-2">{jsxElem}</div>
        }
      </React.Fragment>
    );
  }

  const renderManagedObjectDisplay = () => {
    const funcName = 'renderManagedObjectDisplay';
    const logName = `${componentName}.${funcName}()`;
    
    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="apd-app-view">
            <div className="apd-app-view-detail-left">
              
              <div><b>Environment</b>: {managedObjectDisplay.webhookEnvironmentReference.entityRef.displayName}</div>
              <div>{renderStatus(managedObjectDisplay)}</div>              

              <Divider className="p-mb-2" />

              <div><b>Method</b>: {managedObjectDisplay.webhookWithoutEnvs?.method}</div>
              <div><b>URI</b>: {managedObjectDisplay.webhookWithoutEnvs?.uri}</div>
              <div><b>Mode</b>: {managedObjectDisplay.webhookWithoutEnvs?.mode}</div>

              <div>{renderAuthentication(managedObjectDisplay.webhookWithoutEnvs?.authentication)}</div>              
              {/* TEST */}
              {/* <hr/>
              <div>{renderAuthentication(undefined)}</div>              
              <div>{renderAuthentication({
                authMethod: WebHookBasicAuth.authMethod.BASIC,
                username: 'username',
                password: 'password'
              })}</div>              
              <div>{renderAuthentication({
                authMethod: WebHookHeaderAuth.authMethod.HEADER,
                headerName: 'headerName',
                headerValue: 'headerValue'
              })}</div>              
              <hr/> */}

              {/* <div><b>Trusted Common Names</b>: {JSON.stringify(managedObjectDisplay.webhookWithoutEnvs?.tlsOptions?.tlsTrustedCommonNames)}</div> */}
              <div>{renderTrustedCNs(managedObjectDisplay.webhookWithoutEnvs?.tlsOptions?.tlsTrustedCommonNames)}</div>              
              {/* <div>{renderTrustedCNs(['a', 'b'])}</div>               */}


            </div>
            <div className="apd-app-view-detail-right">
              <div>App Status: {managedObjectDisplay.references.apiAppResponse.status}</div>
              {/* <div>Internal Name: </div>
              <div className="p-ml-2">{managedObjectDisplay.references.apiAppResponse.internalName}</div> */}
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }


  return (
    <React.Fragment>
      <div className="apd-manage-user-apps">

        <APComponentHeader header={`Webhook for App: ${props.managedAppWebhooks.appDisplayName}`} />

        {managedObjectDisplay && renderManagedObjectDisplay() }
      
      </div>

      {/* DEBUG */}
      {/* {managedObjectDisplay && 
        <div>
          <hr/>
          <div>managedObjectDisplay:</div>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectDisplay, null, 2)}
          </pre>
        </div>
      } */}
    </React.Fragment>
  );
}
