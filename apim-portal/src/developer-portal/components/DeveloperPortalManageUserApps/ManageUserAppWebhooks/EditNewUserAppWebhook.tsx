
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APAppWebhooksDisplayService, { 
  IAPAppWebhookDisplay 
} from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageUserAppWebhooksCommon";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { EditNewUserAppWebhookForm } from "./EditNewUserAppWebhookForm";
import { TAPAppEnvironmentDisplayList } from "../../../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewUserAppWebhookProps {
  /** both */
  action: EAction;
  organizationId: string;
  apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onEditNewSuccess: (apiCallState: TApiCallState, apAppWebhookDisplayEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean, isLoadingHeader?: JSX.Element) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  /** edit: required */
  apAppWebhookDisplayEntityId?: TAPEntityId;
  onNavigateToCommand?: (apAppWebhookDisplayEntityId: TAPEntityId) => void;
}

export const EditNewUserAppWebhook: React.FC<IEditNewUserAppWebhookProps> = (props: IEditNewUserAppWebhookProps) => {
  const ComponentName = 'EditNewUserAppWebhook';

  type TManagedObject = IAPAppWebhookDisplay;

  const LoadingHeader: JSX.Element = (<div>Provisioning Webhook on Environment(s)</div>);
  const ButtonLabel_Cancel = "Cancel";
  const ButtonLabel_Save = "Save";
  const FormId = `DeveloperPortalManageUserApps_ManageUserAppWebhooks_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [available_ApAppEnvironmentDisplayList, setAvailable_ApAppEnvironmentDisplayList] = React.useState<TAPAppEnvironmentDisplayList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetAvailable_ApAppEnvironmentDisplayList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetAvailable_ApAppEnvironmentDisplayList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_WEBHOOK_AVAILABLE_ENVIRONMENTS, `retrieve list of available webhook environments for app: ${props.apDeveloperPortalUserAppDisplay.apEntityId.displayName}`);
    try { 
      const apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList = await APAppWebhooksDisplayService.apiGetList_WebhookAvailableApEnvironmentDisplayList_For_ApAppDisplay({
        organizationId: props.organizationId,
        apAppDisplay: props.apDeveloperPortalUserAppDisplay,
        webhookId: props.apAppWebhookDisplayEntityId ? props.apAppWebhookDisplayEntityId.id : undefined
      });
      setAvailable_ApAppEnvironmentDisplayList(apAppEnvironmentDisplayList);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    if(props.action === EAction.NEW) return apiGetManagedObject_New();
    else return apiGetManagedObject_Edit();
  }

  const apiGetManagedObject_New = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject_New';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_WEBHOOK, 'create empty webhook');
    try {
      const empty: IAPAppWebhookDisplay = APAppWebhooksDisplayService.create_Empty_ApAppWebhookDisplay();
      setManagedObject(empty);
      // test error handling
      // throw new Error(`${logName}: test error handling`);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetManagedObject_Edit = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject_Edit';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.apAppWebhookDisplayEntityId === undefined) throw new Error(`${logName}: props.apAppWebhookDisplayEntityId === undefined`);
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

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_APP_WEBHOOK, `create webhook: ${mo.apEntityId.displayName}`);
    try {
      await APAppWebhooksDisplayService.apiCreate_ApAppWebhookDisplay({
        organizationId: props.organizationId,
        appId: props.apDeveloperPortalUserAppDisplay.apEntityId.id,
        apAppMeta: props.apDeveloperPortalUserAppDisplay.apAppMeta,
        apAppWebhookDisplay: mo  
      });
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_APP_WEBHOOK, `update webhook: ${mo.apEntityId.displayName}`);
    try {
      await APAppWebhooksDisplayService.apiUpdate_ApAppWebhookDisplay({
        organizationId: props.organizationId,
        appId: props.apDeveloperPortalUserAppDisplay.apEntityId.id,
        apAppMeta: props.apDeveloperPortalUserAppDisplay.apAppMeta,
        apAppWebhookDisplay: mo  
      });
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetAvailable_ApAppEnvironmentDisplayList();
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const validateProps = () => {
    const funcName = 'validateProps';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EAction.EDIT) {
      if(props.apAppWebhookDisplayEntityId === undefined) throw new Error(`${logName}: props.apAppWebhookDisplayEntityId === undefined`);
      if(props.onNavigateToCommand === undefined) throw new Error(`${logName}: props.onNavigateToCommand === undefined`);
    }
  }

  const EditNewUserAppWebhook_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    const funcName = 'EditNewUserAppWebhook_onNavigateToCommand';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.onNavigateToCommand === undefined) throw new Error(`${logName}: props.onNavigateToCommand === undefined`);
    if(props.apAppWebhookDisplayEntityId === undefined) throw new Error(`${logName}: props.apAppWebhookDisplayEntityId === undefined`);
    props.onNavigateToCommand(props.apAppWebhookDisplayEntityId);
  }

  const setBreadCrumbItemList = () => {
    const funcName = 'setBreadCrumbItemList';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EAction.EDIT) {
      if(props.apAppWebhookDisplayEntityId === undefined) throw new Error(`${logName}: props.apAppWebhookDisplayEntityId === undefined`);
      props.setBreadCrumbItemList([
        {
          label: props.apAppWebhookDisplayEntityId.displayName,
          command: EditNewUserAppWebhook_onNavigateToCommand
        },
        {
          label: 'Edit'
        }  
      ]);  
    } else {
      props.setBreadCrumbItemList([{
        label: 'New Webhook'
      }]);  
    }
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    validateProps();
    setBreadCrumbItemList();
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_APP_WEBHOOK || apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_APP_WEBHOOK) {
          if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
          props.onEditNewSuccess(apiCallStatus, managedObject.apEntityId);  
        }
      }          
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmit = async(mo: TManagedObject) => {
    props.onLoadingChange(true, LoadingHeader);
    if(props.action === EAction.NEW) await apiCreateManagedObject(mo);
    else await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }
  const onSubmit = (mo: TManagedObject) => {
    setManagedObject(mo);
    doSubmit(mo);
  }

  const onError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Cancel} type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Save} form={FormId} type="submit" label={ButtonLabel_Save} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-6">
        <div className="p-fluid">
          <EditNewUserAppWebhookForm
            organizationId={props.organizationId}
            action={props.action}
            apDeveloperPortalUserAppDisplay={props.apDeveloperPortalUserAppDisplay}
            available_ApAppEnvironmentDisplayList={available_ApAppEnvironmentDisplayList}
            formId={FormId}
            apAppWebhookDisplay={mo}
            onError={onError}
            // onLoadingChange={props.onLoadingChange}
            onSubmit={onSubmit}
          />
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }


  // const renderInfo = () => {
  //   return (
  //     <React.Fragment>
  //       <div><b>App Status</b>: {managedObject?.references.apiAppResponse.status}</div>
  //       <div><b>Environment</b>: {managedObject?.webhookEnvironmentReference.entityRef.displayName}</div>
  //     </React.Fragment>
  //   );
  // }

  // const getComponentHeader = (): string => {
  //   const funcName = 'getComponentHeader';
  //   const logName = `${componentName}.${funcName}()`;
  //   const appStatus: AppStatus | undefined = props.managedAppWebhooks.apiAppResponse.status;
  //   if(!appStatus) throw new Error(`${logName}: appStatus is undefined`);
  //   switch(appStatus) {
  //     case AppStatus.PENDING:
  //       if(props.action === EAction.NEW) return `Create New Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
  //       else if(props.action === EAction.EDIT) return `Edit Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
  //       else throw new Error(`${logName}: unknown props.action = ${props.action}`);
  //     case AppStatus.APPROVED:
  //       if(props.action === EAction.NEW) return `Provision New Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
  //       else if(props.action === EAction.EDIT) return `Re-Provision Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
  //       else throw new Error(`${logName}: unknown props.action = ${props.action}`);
  //     case AppStatus.REVOKED:
  //       throw new Error(`${logName}: App in status revoked, handle properly.`);
  //       // if(props.action === EAction.NEW) return `Provision New Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
  //       // else if(props.action === EAction.EDIT) return `Re-Provision Webhook for App: ${props.managedAppWebhooks.appDisplayName}`;
  //       // else throw new Error(`${logName}: unknown props.action = ${props.action}`);
  //     default:
  //       Globals.assertNever(logName, appStatus);
  //   }
  //   return '';
  // }

  const getComponentHeader = (): string => {
    if(props.action === EAction.NEW) return "Create New Webhook";
    else return "Edit Webhook";
  }

  return (
    <div className="apd-manage-user-apps">

      <APComponentHeader header={getComponentHeader()} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {/* <div className="p-mt-4">
        {renderInfo()}
      </div> */}

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
