import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { EAppType, E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageAppsCommon";
import { EditGeneral } from "./EditGeneral";
import { TAPAppDisplay_General } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { DeveloperPortalDisplayAppHeaderInfo } from "../DeveloperPortalDisplayAppHeaderInfo";
import APDeveloperPortalTeamAppsDisplayService, { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { Globals } from "../../../../utils/Globals";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IManageEditAppProps {
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

export const ManageEditApp: React.FC<IManageEditAppProps> = (props: IManageEditAppProps) => {
  const ComponentName = 'ManageEditApp';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;

  const [userContext] = React.useContext(UserContext);
  const [organizationContext] = React.useContext(OrganizationContext);

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);


  const ManagedEditApp_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.appEntityId);
  }

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve details for app: ${props.appEntityId.displayName}`);
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
            apOrganizationAppSettings: { apAppCredentialsExpiryDuration_millis: organizationContext.apAppCredentialsExpiryDuration_millis }
          });
          setManagedObject(apDeveloperPortalTeamAppDisplay);
          break;
        default:
          Globals.assertNever(logName, props.appType);
      }
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
        command: ManagedEditApp_onNavigateToCommand
      },
      {
        label: 'Edit'
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

  const onSaveSuccess_General = (apiCallState: TApiCallState, apAppDisplay_General: TAPAppDisplay_General) => {
    props.onSaveSuccess(apiCallState);
    doInitialize();
  }

  // const onSaveSuccess_Credentials = (apiCallState: TApiCallState, apAppDisplay_Credentials: TAPAppDisplay_Credentials) => {
  //   props.onSaveSuccess(apiCallState);
  //   doInitialize();
  // }

  const onError = (apiCallStatus: TApiCallState) => {
    setApiCallStatus(apiCallStatus);
    props.onError(apiCallStatus);
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <DeveloperPortalDisplayAppHeaderInfo
        apAppDisplay={mo}
      />
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
          <TabPanel header='General'>
            <React.Fragment>
              <EditGeneral
                // key={`${ComponentName}_EditGeneral_${refreshCounter}`}
                organizationId={props.organizationId}
                apDeveloperPortalAppDisplay={managedObject}
                onCancel={props.onCancel}
                onError={onError}
                onSaveSuccess={onSaveSuccess_General}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          {/* <TabPanel header='Credentials'>
            <React.Fragment>
              <EditCredentials
                key={`${ComponentName}_EditCredentials_${refreshCounter}`}
                organizationId={props.organizationId}
                apDeveloperPortalAppDisplay={managedObject}
                onCancel={props.onCancel}
                onError={onError}
                onSaveSuccess={onSaveSuccess_Credentials}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel> */}
        </TabView>
      </React.Fragment>
    ); 
  }

  return (
    <div className="apd-manage-user-apps">

      {managedObject && <APComponentHeader header={`Edit App: ${managedObject.apEntityId.displayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && renderContent() }

    </div>
  );

}