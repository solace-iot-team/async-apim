
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "./ManageAppWebhooksCommon";
import APAppWebhooksDisplayService, { 
  IAPAppWebhookDisplay 
} from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { APDisplayAppWebhook } from "../../../../components/APDisplay/APDisplayWebhooks/APDisplayAppWebhook";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IViewAppWebhookProps {
  organizationId: string;
  apDeveloperPortalAppDisplay: TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;
  apAppWebhookDisplayEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHereCommand: (apAppWebhookDisplayEntityId: TAPEntityId) => void;
}

export const ViewAppWebhook: React.FC<IViewAppWebhookProps> = (props: IViewAppWebhookProps) => {
  const ComponentName = 'ViewAppWebhook';

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
        apAppMeta: props.apDeveloperPortalAppDisplay.apAppMeta,
        appId: props.apDeveloperPortalAppDisplay.apEntityId.id,
        apAppEnvironmentDisplayList: props.apDeveloperPortalAppDisplay.apAppEnvironmentDisplayList,
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

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <div className="p-mt-4 p-ml-2">
        <APDisplayAppWebhook
          apAppWebhookDisplay={managedObject}
        />
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
