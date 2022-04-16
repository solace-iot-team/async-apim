import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageUserAppsCommon";
import { EditApiProducts } from "./EditApiProducts";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IManageApiProductProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToCommand: (appEntityId: TAPEntityId) => void;
}

export const ManageApiProducts: React.FC<IManageApiProductProps> = (props: IManageApiProductProps) => {
  const ComponentName = 'ManageApiProducts';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [userContext] = React.useContext(UserContext);

  const ManageApiProducts_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.appEntityId);
  }

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve app: ${props.appEntityId.displayName}`);
    try { 
      const object: TAPDeveloperPortalUserAppDisplay = await APDeveloperPortalUserAppsDisplayService.apiGet_ApDeveloperPortalUserAppDisplay({
        organizationId: props.organizationId,
        userId: userContext.apLoginUserDisplay.apEntityId.id,
        appId: props.appEntityId.id
      });
      setManagedObject(object);
    } catch(e) {
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

  const setBreadCrumbItemList = (moDisplayName: string) => {
    props.setBreadCrumbItemList([
      {
        label: moDisplayName,
        command: ManageApiProducts_onNavigateToCommand
      },
      {
        label: 'Manage API Products'
      }  
    ]);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setBreadCrumbItemList(managedObject.apEntityId.displayName);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSaveSuccess = (apiCallState: TApiCallState) => {
    props.onSaveSuccess(apiCallState);
  }

  const onError = (apiCallStatus: TApiCallState) => {
    setApiCallStatus(apiCallStatus);
    props.onError(apiCallStatus);
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="apd-app-view">
          <div className="apd-app-view-detail-left">
            <div><b>Status: </b>{mo.apAppStatus}</div>
            <div>TEST: connector status:{mo.devel_connectorAppResponses.smf.status}</div>
          </div>
          <div className="apd-app-view-detail-right">
            <div>Id: {mo.apEntityId.id}</div>
          </div>            
        </div>
      </div>  
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return (
      <React.Fragment>
        <div className="p-mt-2">
          {renderHeader(managedObject)}
        </div>              
        <EditApiProducts
          // key={ComponentName + '_EditApiProducts_' + refreshCounter}
          organizationId={props.organizationId}
          apDeveloperPortalUserAppDisplay={managedObject}
          onSaveSuccess={onSaveSuccess}
          onError={onError}
          onCancel={props.onCancel}
          onLoadingChange={props.onLoadingChange}
        />
      </React.Fragment>
    ); 
  }

  return (
    <div className="apd-manage-user-apps">

      {managedObject && <APComponentHeader header={`Manage API Products for: ${managedObject.apEntityId.displayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && renderContent() }

    </div>
  );

}