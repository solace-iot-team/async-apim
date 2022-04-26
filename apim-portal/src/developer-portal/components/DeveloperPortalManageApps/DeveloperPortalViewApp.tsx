
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { Globals } from "../../../utils/Globals";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APDeveloperPortalTeamAppsDisplayService, { TAPDeveloperPortalTeamAppDisplay } from "../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageAppsCommon";
import { APDisplayDeveloperPortalAppApiProducts } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_ApiProducts";
import { APDisplayDeveloperPortalAppCredentialsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_Credentials_Panel";
import { APDisplayDeveloperPortalAppEndpointsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_Endpoints_Panel";
import APAppEnvironmentsDisplayService from "../../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { APDisplayDeveloperPortalAppEnvironmentChannelPermissionsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_EnvironmentChannelPermissions_Panel";
import { APDisplayDeveloperPortalAppApiProductsClientInformationPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_ApiProducts_ClientInformation_Panel";
import APDeveloperPortalAppApiProductsDisplayService from "../../displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { APDisplayDeveloperPortalAppAsyncApiSpecs } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalAppAsyncApiSpecs";
import { APDisplayApAttributeDisplayList } from "../../../components/APDisplay/APDisplayApAttributeDisplayList";
import { APDisplayAppWebhookList } from "../../../components/APDisplay/APDisplayAppWebhookList";
import { DeveloperPortalDisplayAppHeaderInfo } from "./DeveloperPortalDisplayAppHeaderInfo";
import { EAppType } from "./DeveloperPortalManageAppsCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageApps.css";

export interface IDeveloperPortalViewAppProps {
  appType: EAppType;
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (appEntityId: TAPEntityId) => void;
}

export const DeveloperPortalViewApp: React.FC<IDeveloperPortalViewAppProps> = (props: IDeveloperPortalViewAppProps) => {
  const ComponentName = 'DeveloperPortalViewApp';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;

  const MessageNoWebhooksFound = 'No Webhooks configured.';

  const [userContext] = React.useContext(UserContext);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.appType === EAppType.TEAM) {
      if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    }
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve details for app: ${props.appEntityId.displayName}`);
    try { 
      switch(props.appType) {
        case EAppType.USER:
          const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = await APDeveloperPortalUserAppsDisplayService.apiGet_ApDeveloperPortalUserAppDisplay({
            organizationId: props.organizationId,
            userId: userContext.apLoginUserDisplay.apEntityId.id,
            appId: props.appEntityId.id
          });
          setManagedObject(apDeveloperPortalUserAppDisplay);
          break;
        case EAppType.TEAM:
          if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
          const apDeveloperPortalTeamAppDisplay: TAPDeveloperPortalTeamAppDisplay = await APDeveloperPortalTeamAppsDisplayService.apiGet_ApDeveloperPortalTeamAppDisplay({
            organizationId: props.organizationId,
            appId: props.appEntityId.id,
            teamId: userContext.runtimeSettings.currentBusinessGroupEntityId.id
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

  const DeveloperPortalViewApp_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(props.appEntityId);
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
        command: DeveloperPortalViewApp_onNavigateHereCommand
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

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <DeveloperPortalDisplayAppHeaderInfo
        apAppDisplay={mo}
      />
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <React.Fragment>

        {renderHeader(managedObject)}

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General'>

            <APDisplayDeveloperPortalAppCredentialsPanel
              appCredentials={managedObject.apAppCredentials}
              componentTitle="Credentials"
              collapsed={true}
            />

            <APDisplayDeveloperPortalAppEndpointsPanel
              apEnvironmentEndpointList={APAppEnvironmentsDisplayService.get_apEnvironmentEndpointDisplayList({ apAppEnvironmentDisplayList: managedObject.apAppEnvironmentDisplayList })}                  
              collapsed={true}
              emptyMessage="No Endpoints found."
              componentTitle="Connection Endpoints"
            />

            <APDisplayDeveloperPortalAppEnvironmentChannelPermissionsPanel
              apAppEnvironmentDisplayList={managedObject.apAppEnvironmentDisplayList}
              collapsed={true}
              emptyMessage="No Channel Permissions / Topics found."
              componentTitle="Channel Permissions / Topics"
            />

            <APDisplayDeveloperPortalAppApiProductsClientInformationPanel
              apAppStatus={managedObject.apAppStatus}
              apApp_ApiProduct_ClientInformationDisplayList={APDeveloperPortalAppApiProductsDisplayService.get_ApApp_ApiProduct_ClientInformationDisplayList({ apAppApiProductDisplayList: managedObject.apAppApiProductDisplayList })}
              collapsed={true}
              emptyMessage="No Client Information available."
              componentTitle="Client Information"
            />

          </TabPanel>
          <TabPanel header="API Products">
            <APDisplayDeveloperPortalAppApiProducts
              apDeveloperPortalApp_ApiProductDisplayList={managedObject.apAppApiProductDisplayList}
              className="p-mt-2 p-ml-2"
              emptyMessage="No API Products defined."
            />
            {managedObject.apAppApiProductDisplayList.length > 0 &&
              <React.Fragment>
                <div className="p-text-bold p-mt-4 p-ml-2">App Channel Parameters:</div>
                <APDisplayApAttributeDisplayList
                  apAttributeDisplayList={managedObject.apAppChannelParameterList}
                  tableRowHeader_AttributeName="App Channel Parameter"
                  tableRowHeader_AttributeValue="Value(s)"
                  emptyMessage="No App Channel Parameters defined."
                  className="p-ml-2 p-mt-2"
                />
              </React.Fragment>
            }
          </TabPanel>
          <TabPanel header='Async API Specs'>
            <APDisplayDeveloperPortalAppAsyncApiSpecs
              organizationId={props.organizationId}
              appId={props.appEntityId.id}
              apAppApiDisplayList={managedObject.apAppApiDisplayList}
              onError={props.onError}
              onLoadingChange={props.onLoadingChange}
            />
          </TabPanel>
          <TabPanel header="Webhooks">
            {/* <div className="p-mt-2 p-mb-2 p-ml-2"><em>Double-click to see the status.</em></div> */}
            <APDisplayAppWebhookList
              organizationId={props.organizationId}
              apDeveloperPortalUserAppDisplay={managedObject}
              onError={props.onError}
              onLoadingChange={props.onLoadingChange}
              emptyMessage={MessageNoWebhooksFound}
            />
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="apd-manage-user-apps">

        {managedObject && <APComponentHeader header={`App: ${managedObject.apEntityId.displayName}`} /> }

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObject && renderManagedObject() }
      
      </div>

    </React.Fragment>
  );
}
