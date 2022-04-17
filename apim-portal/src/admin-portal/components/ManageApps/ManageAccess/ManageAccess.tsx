import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { 
  TAPAppDisplay_Credentials 
} from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import APAdminPortalAppsDisplayService, { TAPAdminPortalAppDisplay } from "../../../displayServices/APAdminPortalAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageAppsCommon";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IManageAccessProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToCommand: (appEntityId: TAPEntityId) => void;
}

export const ManageAccess: React.FC<IManageAccessProps> = (props: IManageAccessProps) => {
  const ComponentName = 'ManageAccess';

  type TManagedObject = TAPAdminPortalAppDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [userContext] = React.useContext(UserContext);

  const ManagedAccess_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.appEntityId);
  }

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve details for app: ${props.appEntityId.displayName}`);
    try { 
      const apAdminPortalAppDisplay: TAPAdminPortalAppDisplay = await APAdminPortalAppsDisplayService.apiGet_ApAdminPortalAppDisplay({
        organizationId: props.organizationId,
        appId: props.appEntityId.id
      });
      setManagedObject(apAdminPortalAppDisplay);
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

  const setBreadCrumbItemList = (moDisplayName: string) => {
    props.setBreadCrumbItemList([
      {
        label: moDisplayName,
        command: ManagedAccess_onNavigateToCommand
      },
      {
        label: 'Manage Access'
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
    setRefreshCounter(refreshCounter + 1);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSaveSuccess_Credentials = (apiCallState: TApiCallState, apAppDisplay_Credentials: TAPAppDisplay_Credentials) => {
    // const funcName = 'onSaveSuccess_Credentials';
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: apAppDisplay_Credentials.apAppCredentials.secret.consumerSecret = ${apAppDisplay_Credentials.apAppCredentials.secret.consumerSecret}`)
    props.onSaveSuccess(apiCallState);
    doInitialize();
  }

  const onError = (apiCallStatus: TApiCallState) => {
    setApiCallStatus(apiCallStatus);
    props.onError(apiCallStatus);
  }

  // should be a reusable component
  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="ap-app-view">
          <div className="ap-app-view-detail-left">
            <div><b>Status: {mo.apAppStatus}</b></div>
            <div>TEST: connector status:{mo.devel_connectorAppResponses.smf.status}</div>
            <div className="p-mt-2"></div>
            <div>App Type: {mo.apAppMeta.apAppType}</div>
            <div>App Owner Id: {mo.apAppMeta.appOwnerId}</div>
            <div>App Owner Type: {mo.apAppMeta.apAppOwnerType}</div>
          </div>
          <div className="ap-app-view-detail-right">
            <div>Id: {mo.apEntityId.id}</div>
            <div>Internal Name: {mo.apAppInternalName}</div>
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

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='API Products'>
            <React.Fragment>
              <p>TODO: approve/revoke access by product</p>
              <p>TODO: set the channel paramters - across all products</p>
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Credentials'>
            <React.Fragment>
              <p>TODO: EditCredentials</p>
              {/* <EditCredentials
                key={`${ComponentName}_EditCredentials_${refreshCounter}`}
                organizationId={props.organizationId}
                apDeveloperPortalUserAppDisplay={managedObject}
                onCancel={props.onCancel}
                onError={onError}
                onSaveSuccess={onSaveSuccess_Credentials}
                onLoadingChange={props.onLoadingChange}
              /> */}
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }

  return (
    <div className="ap-manage-apps">

      {managedObject && <APComponentHeader header={`Manage Access for App: ${managedObject.apEntityId.displayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && renderContent() }

    </div>
  );

}