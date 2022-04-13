
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { EAction, E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageUserAppsCommon";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { DeveloperPortalEditNewUserAppForm } from "./DeveloperPortalEditNewUserAppForm";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalEditNewUserAppProps {
  action: EAction,
  organizationId: string,
  userId: string,
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  /** edit: required */
  appEntityId?: TAPEntityId;
  onNavigateToCommand?: (appEntityId: TAPEntityId) => void;
  onEditSuccess?: (apiCallState: TApiCallState, appEntityId: TAPEntityId) => void;
  /** new:required */
  onNewSuccess?: (apiCallState: TApiCallState, appEntityId: TAPEntityId) => void;
  /** optional */
  // presetApiProductSelectItemList?: TApiEntitySelectItemList,
  // needs 1 apiProductEntityId to prepopulate the form
}

export const DeveloperPortalEditNewUserApp: React.FC<IDeveloperPortalEditNewUserAppProps> = (props: IDeveloperPortalEditNewUserAppProps) => {
  const ComponentName = 'DeveloperPortalEditNewUserApp';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay;

  const ButtonLabel_EditSave = 'Save';
  const ButtonLabel_NewSave = 'Create';
  const ButtonLabel_Cancel = 'Cancel';
  const FormId = `DeveloperPortalManageUserApps_EditNew_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    if(props.action === EAction.NEW) return apiGetManagedObject_New();
    else return apiGetManagedObject_Edit();
  }



  // TODO: could pass the apiProductEntityId into this?
  // or use a setter method instead?

  const apiGetManagedObject_New = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject_New';
    const logName = `${ComponentName}.${funcName}()`;

    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_USER_APP, `create new app`);
    try { 
      const empty: TAPDeveloperPortalUserAppDisplay = APDeveloperPortalUserAppsDisplayService.create_Empty_ApDeveloperPortalUserAppDisplay({
        userId: props.userId
      });
      setManagedObject(empty);
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
    if(props.appEntityId === undefined) throw new Error(`${logName}: props.appEntityId === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve details for app: ${props.appEntityId.displayName}`);
    try {
      const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = await APDeveloperPortalUserAppsDisplayService.apiGet_ApDeveloperPortalUserAppDisplay({
        organizationId: props.organizationId,
        userId: props.userId,
        appId: props.appEntityId.id
      });      
      setManagedObject(apDeveloperPortalUserAppDisplay);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_USER_APP, `create app: ${mo.apEntityId.displayName}`);
    try {
      await APDeveloperPortalUserAppsDisplayService.apiCreate_ApDeveloperPortalUserAppDisplay({
        organizationId: props.organizationId,
        apDeveloperPortalUserAppDisplay: mo
      });
      // const createdApiObject: App = await AppsService.createDeveloperApp({
      //   organizationName: orgId, 
      //   developerUsername: userId, 
      //   requestBody: transformManagedObjectToCreateApiObject(managedObject)
      // });
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }


  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP, `update app: ${mo.apEntityId.displayName}`);
    try { 
      await APDeveloperPortalUserAppsDisplayService.apiUpdate_ApDeveloperPortalUserAppDisplay({
        organizationId: props.organizationId,
        apDeveloperPortalUserAppDisplay: mo
      })
      // await AppsService.updateDeveloperApp({
      //   organizationName: orgId, 
      //   developerUsername: userId, 
      //   appName: appId, 
      //   requestBody: transformManagedObjectToUpdateApiObject(managedObject)
      // });
      // if(appDisplayName !== managedObject.apiObject.displayName) setUpdatedManagedObjectDisplayName(managedObject.apiObject.displayName);      
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }


  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const validateProps = () => {
    const funcName = 'validateProps';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EAction.EDIT) {
      if(props.appEntityId === undefined) throw new Error(`${logName}: props.appEntityId === undefined`);
      if(props.onNavigateToCommand === undefined) throw new Error(`${logName}: props.onNavigateToCommand === undefined`);
      if(props.onEditSuccess === undefined) throw new Error(`${logName}: props.onEditSuccess === undefined`);
    }
    if(props.action === EAction.NEW) {
      if(props.onNewSuccess === undefined) throw new Error(`${logName}: props.onNewSuccess === undefined`);
    }
  }

  const DeveloperPortalManageUserApps_EditNew_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    const funcName = 'DeveloperPortalManageUserApps_EditNew_onNavigateToCommand';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.onNavigateToCommand === undefined) throw new Error(`${logName}: props.onNavigateToCommand === undefined`);
    if(props.appEntityId === undefined) throw new Error(`${logName}: props.appEntityId === undefined`);
    props.onNavigateToCommand(props.appEntityId);
  }

  const setBreadCrumbItemList = () => {
    const funcName = 'setBreadCrumbItemList';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EAction.EDIT) {
      if(props.appEntityId === undefined) throw new Error(`${logName}: props.appEntityId === undefined`);
      props.setBreadCrumbItemList([
        {
          label: props.appEntityId.displayName,
          command: DeveloperPortalManageUserApps_EditNew_onNavigateToCommand
        },
        {
          label: 'Edit'
        }  
      ]);  
    } else {
      props.setBreadCrumbItemList([{
        label: 'New App'
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
    if(managedObject === undefined) return;
    setIsInitialized(true);
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_USER_APP) {
        if(props.onNewSuccess === undefined) throw new Error(`${logName}: props.onNewSuccess === undefined`);
        if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
        props.onNewSuccess(apiCallStatus, managedObject.apEntityId);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP) {
        if(props.onEditSuccess === undefined) throw new Error(`${logName}: props.onEditSuccess === undefined`);
        if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
        props.onEditSuccess(apiCallStatus, managedObject.apEntityId);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmit = async() => {
    const funcName = 'doSubmit';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    props.onLoadingChange(true);
    if(props.action === EAction.EDIT) await apiUpdateManagedObject(managedObject);
    else await apiCreateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const onSubmit = () => {
    doSubmit();
  }


  const renderComponentFooter = (): JSX.Element => {
    const componentFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Cancel} type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={props.onCancel} />
          {props.action === EAction.EDIT &&
            <Button key={ComponentName+ButtonLabel_EditSave} form={FormId} type="submit"label={ButtonLabel_EditSave} icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
          }
          {props.action === EAction.NEW &&
            <Button key={ComponentName+ButtonLabel_NewSave} form={FormId} type="submit" label={ButtonLabel_NewSave} icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
          }
        </React.Fragment>
      );
    }
    return (<Toolbar className="p-mb-4" right={componentFooterRightToolbarTemplate} />);
  }

  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return(
      <React.Fragment>
        <DeveloperPortalEditNewUserAppForm
          action={props.action}
          formId={FormId}
          organizationId={props.organizationId}
          apDeveloperPortalUserAppDisplay={managedObject}
          onSubmit={onSubmit}
          onError={props.onError}
          onLoadingChange={props.onLoadingChange}
        />
        {renderComponentFooter()}
      </React.Fragment>
    );
  }

  return (
    <div className="apd-manage-user-apps">

      { props.action === EAction.NEW && <APComponentHeader header='Create App' /> }

      { props.action === EAction.EDIT && <APComponentHeader header={`Edit App: ${props.appEntityId?.displayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {isInitialized && renderComponent()}

    </div>
  );
}
