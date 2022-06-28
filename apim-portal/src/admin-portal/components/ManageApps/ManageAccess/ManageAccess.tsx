import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import APAdminPortalAppsDisplayService, { 
  TAPAdminPortalAppDisplay 
} from "../../../displayServices/APAdminPortalAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageAppsCommon";
import { EditApiProducts } from "./EditApiProducts";
import { EditChannelParameters } from "./EditChannelParameters";
import { DisplayAppHeaderInfo } from "../DisplayAppHeaderInfo";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";
import { ManageEditCredentials } from "./ManageEditCredentials";

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
  const [organizationContext] = React.useContext(OrganizationContext);

  const ManagedAccess_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.appEntityId);
  }

  // * Api Calls *
  const apiGetManagedObject = async(preserveApiCallStatus: boolean): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve details for app: ${props.appEntityId.displayName}`);
    try { 
      const apAdminPortalAppDisplay: TAPAdminPortalAppDisplay = await APAdminPortalAppsDisplayService.apiGet_ApAdminPortalAppDisplay({
        organizationId: props.organizationId,
        appId: props.appEntityId.id,
        apOrganizationAppSettings: { apAppCredentialsExpiryDuration_millis: organizationContext.apAppCredentialsExpiryDuration_millis }
      });
      setManagedObject(apAdminPortalAppDisplay);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    if(!preserveApiCallStatus) setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async(preserveError: boolean) => {
    props.onLoadingChange(true);
    await apiGetManagedObject(preserveError);
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
    doInitialize(false);
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

  const onSuccess = (apiCallState: TApiCallState) => {
    props.onSaveSuccess(apiCallState);
    doInitialize(false);
  }
  const onSaveSuccess_ChannelParameters = (apiCallState: TApiCallState) => {
    onSuccess(apiCallState);
  }

  const onSaveSuccess_ApiProducts = (apiCallState: TApiCallState) => {
    onSuccess(apiCallState);
  }

  const onSaveSuccess_Credentials = (apiCallState: TApiCallState) => {
    onSuccess(apiCallState);
  }

  const onError = (apiCallStatus: TApiCallState) => {
    setApiCallStatus(apiCallStatus);
    props.onError(apiCallStatus);
    doInitialize(true);
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return (
      <React.Fragment>
        <div className="p-mt-2">
          <DisplayAppHeaderInfo
            key={`${ComponentName}_DisplayAppHeaderInfo_${refreshCounter}`}
            apAdminPortalAppDisplay={managedObject}
          />
        </div>              

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Channel Parameters'>
            <React.Fragment>
              <EditChannelParameters
                key={`${ComponentName}_EditChannelParameters_${refreshCounter}`}
                organizationId={props.organizationId}
                apAdminPortalAppDisplay={managedObject}
                onSaveSuccess={onSaveSuccess_ChannelParameters}
                onCancel={props.onCancel}
                onError={onError}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='API Products'>
            <React.Fragment>
              <EditApiProducts
                key={`${ComponentName}_EditApiProducts_${refreshCounter}`}
                organizationId={props.organizationId}
                apAdminPortalAppDisplay={managedObject}
                onSaveSuccess={onSaveSuccess_ApiProducts}
                onCancel={props.onCancel}
                onError={onError}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Credentials'>
            <React.Fragment>
              <ManageEditCredentials
                key={`${ComponentName}_EditCredentials_${refreshCounter}`}
                organizationId={props.organizationId}
                apAdminPortalAppDisplay={managedObject}
                onCancel={props.onCancel}
                onError={onError}
                onLoadingChange={props.onLoadingChange}
                onSaveSuccess={onSaveSuccess_Credentials}
              />
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