import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APDeveloperPortalTeamAppsDisplayService, { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { EAppType, E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageAppsCommon";
import { EditApiProducts } from "./EditApiProducts";
import { Globals } from "../../../../utils/Globals";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IManageApiProductProps {
  appType: EAppType;
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

  type TManagedObject = TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;

  const HasChangedDialogHeader = "Unsaved Changes";
  const DiscardChangesConfirmDialogButtonLabel = "Discard Changes";

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [hasApiProductListChanged, setHasApiProductListChanged] = React.useState<boolean>(false);
  const [showHasChangedDialog, setShowHasChangedDialog] = React.useState<boolean>(false);

  const [userContext] = React.useContext(UserContext);
  const [organizationContext] = React.useContext(OrganizationContext);

  const ManageApiProducts_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.appEntityId);    
  }

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve app: ${props.appEntityId.displayName}`);
    try { 
      switch(props.appType) {
        case EAppType.USER:
          const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = await APDeveloperPortalUserAppsDisplayService.apiGet_ApDeveloperPortalUserAppDisplay({
            organizationId: props.organizationId,
            userId: userContext.apLoginUserDisplay.apEntityId.id,
            appId: props.appEntityId.id,
            apOrganizationAppSettings: { apAppCredentialsExpiryDuration_millis: organizationContext.apAppCredentialsExpiryDuration_millis },
          });
          setManagedObject(apDeveloperPortalUserAppDisplay);
          break;
        case EAppType.TEAM:
          if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
          const apDeveloperPortalTeamAppDisplay: TAPDeveloperPortalTeamAppDisplay = await APDeveloperPortalTeamAppsDisplayService.apiGet_ApDeveloperPortalTeamAppDisplay({
            organizationId: props.organizationId,
            appId: props.appEntityId.id,
            teamId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
            apOrganizationAppSettings: { apAppCredentialsExpiryDuration_millis: organizationContext.apAppCredentialsExpiryDuration_millis },
          });
          setManagedObject(apDeveloperPortalTeamAppDisplay);
          break;
        default:
          Globals.assertNever(logName, props.appType);
      }
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

  const onCancel = () => {
    if(hasApiProductListChanged) setShowHasChangedDialog(true);
    else props.onCancel();
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="apd-app-view">
          <div className="apd-app-view-detail-left">
            <div><b>Status: </b>{mo.apAppStatus}</div>
          </div>
          <div className="apd-app-view-detail-right">
            <div>Id: {mo.apEntityId.id}</div>
            <div>App status:{mo.devel_connectorAppResponses.smf.status}</div>
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
          appType={props.appType}
          organizationId={props.organizationId}
          apDeveloperPortalAppDisplay={managedObject}
          onSaveSuccess={onSaveSuccess}
          onError={onError}
          onCancel={onCancel}
          onLoadingChange={props.onLoadingChange}
          onApiProductListChange={setHasApiProductListChanged}
        />
      </React.Fragment>
    ); 
  }

  const renderHasChangedDialog = (): JSX.Element => {
    const onDiscardOk = () => { setShowHasChangedDialog(false); props.onCancel(); }
    const onCancel = () => { setShowHasChangedDialog(false); }
    const renderHeader = () => {
      return (<span style={{ color: 'red' }}>{HasChangedDialogHeader}</span>);
    }
    const renderContent = (): JSX.Element => {
      return (
        <React.Fragment>
          <p>You have unsaved changes in list of API Products.</p>
          <p>Are you sure you want to discard the changes?</p>
        </React.Fragment>  
      );
    }  
    const renderFooter = (): JSX.Element =>{
      return (
        <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onCancel} />
          <Button label={DiscardChangesConfirmDialogButtonLabel} icon="pi pi-times" className="p-button-text p-button-plain p-button-outlined" onClick={onDiscardOk} style={{ color: "red", borderColor: 'red'}} />
        </React.Fragment>
      );
    } 
    return (
      <Dialog
        className="p-fluid"
        visible={showHasChangedDialog} 
        style={{ width: '450px' }} 
        header={renderHeader}
        modal
        closable={false}
        footer={renderFooter()}
        onHide={()=> {}}
        contentClassName="apd-manage-user-apps-delete-confirmation-content"
      >
        <div>
          <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
          {renderContent()}
        </div>
      </Dialog>
    );
  } 

  return (
    <div className="apd-manage-user-apps">

      {/* DEBUG */}
      {/* <p>hasApiProductListChanged={String(hasApiProductListChanged)}</p> */}

      {managedObject && <APComponentHeader header={`Manage API Products for: ${managedObject.apEntityId.displayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && renderContent() }

      { showHasChangedDialog && renderHasChangedDialog() }

    </div>
  );

}