
import React from "react";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";

import { APComponentHeader } from "../../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../../utils/ApiCallState";
import { TAPEntityId } from "../../../../../utils/APEntityIdsService";
import { E_CALL_STATE_ACTIONS, EAction, DoLogoutAllUsers } from "../ManageEpSettingsCommon";
import APEpSettingsDisplayService, { IAPEpSettingsDisplay } from "../../../../../displayServices/APEpSettingsDisplayService";
import { EditNewEpSettingForm } from "./EditNewEpSettingForm";
import { APClientConnectorOpenApi } from "../../../../../utils/APClientConnectorOpenApi";
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList, TAPBusinessGroupTreeNodeDisplayList } from "../../../../../displayServices/APBusinessGroupsDisplayService";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";

export interface IManageEditNewEpSettingProps {
  action: EAction;
  organizationId: string;
  apEpSettingDisplayEntityId?: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccessNotification: (apiCallState: TApiCallState) => void;
  onNewSuccess?: (apiCallState: TApiCallState, apEpSettingsDisplay: IAPEpSettingsDisplay) => void;
  onEditSuccess?: (apiCallState: TApiCallState, apEpSettingsDisplay: IAPEpSettingsDisplay) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageEditNewEpSetting: React.FC<IManageEditNewEpSettingProps> = (props: IManageEditNewEpSettingProps) => {
  const ComponentName = 'ManageEditNewEpSetting';

  type TManagedObject = IAPEpSettingsDisplay;

  const NewHeader = "New";
  const EditHeader = "Edit";

  const FormId = `ManageOrganizations_EditNewOrganization_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apBusinessGroupDisplayList, setApBusinessGroupDisplayList] = React.useState<TAPBusinessGroupDisplayList>();
  const [apBusinessGroupTreeNodeDisplayList, setApBusinessGroupTreeNodeDisplayList] = React.useState<TAPBusinessGroupTreeNodeDisplayList>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET, 'get ep settings');
    if(props.apEpSettingDisplayEntityId === undefined) throw new Error(`${logName}: props.apEpSettingDisplayEntityId === undefined`);
    try {
      const apEpSettingsDisplay: IAPEpSettingsDisplay = await APEpSettingsDisplayService.apiGet_ApEpSettingsDisplay({
        organizationId: props.organizationId,
        id: props.apEpSettingDisplayEntityId.id
      });
      setManagedObject(apEpSettingsDisplay);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(createMo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE, 'create ep configuration');
    try {
      const created: IAPEpSettingsDisplay = await APEpSettingsDisplayService.apiCreate_ApEpSettingsDisplay({
       organizationId: props.organizationId,
       apEpSettingsDisplay: createMo,
       doLogoutAllUsers: DoLogoutAllUsers
      });
      setManagedObject(created);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;  
  }

  const apiUpdateManagedObject = async(updateMo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE, 'update ep configuration');
    try {
      const updated: IAPEpSettingsDisplay = await APEpSettingsDisplayService.apiUpdate_ApEpSettingsDisplay({
        organizationId: props.organizationId,
        apEpSettingsDisplay: updateMo,
        doLogoutAllUsers: DoLogoutAllUsers
      });
      setManagedObject(updated);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;  
  }

  const apiGet_TAPBusinessGroupDisplayList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGet_TAPBusinessGroupDisplayList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_TREE_LIST, 'get business group info');
    try {
      const apBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: props.organizationId
      });
      setApBusinessGroupDisplayList(apBusinessGroupDisplayList);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;  
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGet_TAPBusinessGroupDisplayList();
    if(props.action === EAction.EDIT) {
      await apiGetManagedObject();
    } else {
      setManagedObject(APEpSettingsDisplayService.create_Empty_ApEpSettingsDisplay());
    }
    props.onLoadingChange(false);
  }

  const onCreateSuccess = (apiCallState: TApiCallState, apEpSettingsDisplay: IAPEpSettingsDisplay) => {
    const funcName = 'onCreateSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.onNewSuccess === undefined) throw new Error(`${logName}: props.onNewSuccess === undefined`);
    props.onNewSuccess(apiCallState, apEpSettingsDisplay);
  }

  const onUpdateSuccess = (apiCallState: TApiCallState, apEpSettingsDisplay: IAPEpSettingsDisplay) => {
    const funcName = 'onUpdateSuccess';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.onEditSuccess === undefined) throw new Error(`${logName}: props.onEditSuccess === undefined`);
    props.onEditSuccess(apiCallState, apEpSettingsDisplay);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apBusinessGroupDisplayList === undefined) return;
    setApBusinessGroupTreeNodeDisplayList(APBusinessGroupsDisplayService.generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList({
      referenceApBusinessGroupDisplayList: apBusinessGroupDisplayList,
      excludeAccess_To_BusinessGroupIdList: [],
    }));
  }, [apBusinessGroupDisplayList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
    else {
      if(managedObject === undefined) return;
      if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE) onCreateSuccess(apiCallStatus, managedObject);
      if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE) onUpdateSuccess(apiCallStatus, managedObject);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSubmit_EditNew = async(apEpSettingsDisplay: IAPEpSettingsDisplay) => {
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(apEpSettingsDisplay);
    else await apiUpdateManagedObject(apEpSettingsDisplay);
    props.onLoadingChange(false);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          {props.action === EAction.NEW && 
            <Button key={ComponentName+'Create'} form={FormId} type="submit" label="Create" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
          }
          {props.action === EAction.EDIT &&
            <Button key={ComponentName+'Save'} form={FormId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
          }
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderComponent = () => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(apBusinessGroupDisplayList === undefined) throw new Error(`${logName}: apBusinessGroupDisplayList === undefined`);
    if(apBusinessGroupTreeNodeDisplayList === undefined) throw new Error(`${logName}: apBusinessGroupTreeNodeDisplayList === undefined`);
    return (      
        <div className="card p-mt-4">
          <EditNewEpSettingForm     
            action={props.action}
            organizationId={props.organizationId}
            apEpSettingsDisplay={managedObject}
            apBusinessGroupTreeNodeDisplayList={apBusinessGroupTreeNodeDisplayList}
            apBusinessGroupDisplayList={apBusinessGroupDisplayList}
            formId={FormId}
            onSubmit={onSubmit_EditNew}
            onError={props.onError}
          />
          { renderManagedObjectFormFooter() }
        </div>  
    ); 
  }
  const getComponentHeader = (): string => {
    if(props.action === EAction.NEW) return `${NewHeader}:`;
    return `${EditHeader}: ${props.apEpSettingDisplayEntityId?.displayName}`;
  }
  return (
    <div className="manage-organizations">

      <APComponentHeader header={getComponentHeader()} />

      {managedObject && apBusinessGroupDisplayList && apBusinessGroupTreeNodeDisplayList && renderComponent()}

    </div>
  );
}
