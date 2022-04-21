
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APEntityIdsService, { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { EWebhookAuthMethodSelectIdNone, E_CALL_STATE_ACTIONS } from "./ManageUserAppWebhooksCommon";
import APAppWebhooksDisplayService, { IAPAppWebhookDisplay } from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPAppEnvironmentDisplayList } from "../../../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IViewUserAppWebhookProps {
  organizationId: string;
  apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  apAppWebhookDisplayEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHereCommand: (apAppWebhookDisplayEntityId: TAPEntityId) => void;
}

export const ViewUserAppWebhook: React.FC<IViewUserAppWebhookProps> = (props: IViewUserAppWebhookProps) => {
  const ComponentName = 'ViewUserAppWebhook';

  type TManagedObject = IAPAppWebhookDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_WEBHOOK, `retrieve details for webhook: ${props.apAppWebhookDisplayEntityId.displayName}`);
    try { 
      const object: IAPAppWebhookDisplay = await APAppWebhooksDisplayService.apiGet_ApAppWebhookDisplay({
        organizationId: props.organizationId,
        apAppMeta: props.apDeveloperPortalUserAppDisplay.apAppMeta,
        appId: props.apDeveloperPortalUserAppDisplay.apEntityId.id,
        apAppEnvironmentDisplayList: props.apDeveloperPortalUserAppDisplay.apAppEnvironmentDisplayList,
        webhookId: props.apAppWebhookDisplayEntityId.id
      });
      setManagedObject(object);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ViewUserAppWebhook_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHereCommand(props.apAppWebhookDisplayEntityId);
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([
      {
        label: props.apAppWebhookDisplayEntityId.displayName,
        command: ViewUserAppWebhook_onNavigateHereCommand
      },
    ]);  
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setBreadCrumbItemList();
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */  

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // const renderHeader = (mo: TManagedObject): JSX.Element => {
  //   return (
  //     <div className="p-col-12">
  //       <div className="apd-app-view">
  //         <div className="apd-app-view-detail-left">
  //           <div><b>Status: </b>{mo.apAppStatus}</div>
  //           <div>TEST: connector status:{mo.devel_connectorAppResponses.smf.status}</div>
  //           {/* <div><b>Internal Name</b>: {managedObjectDisplay.apiAppResponse_smf.internalName}</div> */}
  //         </div>
  //         <div className="apd-app-view-detail-right">
  //           <div>Id: {mo.apEntityId.id}</div>
  //         </div>            
  //       </div>
  //     </div>  
  //   );
  // }

  const renderEnvironments = (apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList): string => {
    return APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(apAppEnvironmentDisplayList).join(', ');
  }
  const renderAuth = (mo: TManagedObject): string | undefined => {
    if(mo.apWebhookBasicAuth) return mo.apWebhookBasicAuth.authMethod;
    if(mo.apWebhookHeaderAuth) return mo.apWebhookHeaderAuth.authMethod;
    return EWebhookAuthMethodSelectIdNone.NONE;
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <div className="p-mt-4 p-ml-2">
        
        <div><b>Name: </b>{managedObject.apEntityId.displayName}</div>
        <div><b>Environment(s): </b>{renderEnvironments(managedObject.apAppEnvironmentDisplayList)}</div>
        <div><b>Method: </b>{managedObject.apWebhookMethod}</div>
        <div><b>URI: </b>{managedObject.apWebhookUri}</div>
        <div><b>Mode: </b>{managedObject.apWebhookMode}</div>
        <div><b>Auth: </b>{renderAuth(managedObject)}</div>

      </div>
    ); 
  }

  return (
    <React.Fragment>
      <div className="apd-manage-user-apps">

        {managedObject && <APComponentHeader header={`Webhook: ${managedObject.apEntityId.displayName}`} /> }

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObject && renderManagedObject() }
      
      </div>
    </React.Fragment>
  );
}
