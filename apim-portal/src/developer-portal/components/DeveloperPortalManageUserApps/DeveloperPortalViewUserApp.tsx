
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageUserAppsCommon";
import { APDisplayDeveloperPortalAppApiProducts } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_ApiProducts";
import { APDisplayDeveloperPortalAppCredentialsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_Credentials_Panel";
import { APDisplayDeveloperPortalAppEndpointsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_Endpoints_Panel";
import APAppEnvironmentsDisplayService from "../../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { APDisplayDeveloperPortalAppEnvironmentChannelPermissionsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_EnvironmentChannelPermissions_Panel";
import { APDisplayDeveloperPortalAppApiProductsClientInformationPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_ApiProducts_ClientInformation_Panel";
import APDeveloperPortalAppApiProductsDisplayService from "../../displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { APDisplayDeveloperPortalAppAsyncApiSpecs } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalAppAsyncApiSpecs";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalViewUserAppProps {
  organizationEntityId: TAPEntityId;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (appEntityId: TAPEntityId) => void;
}

export const DeveloperPortalViewUserApp: React.FC<IDeveloperPortalViewUserAppProps> = (props: IDeveloperPortalViewUserAppProps) => {
  const componentName = 'DeveloperPortalViewUserApp';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay;

  const [userContext] = React.useContext(UserContext);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve details for app: ${props.appEntityId.displayName}`);
    try { 

      const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = await APDeveloperPortalUserAppsDisplayService.apiGet_ApDeveloperPortalUserAppDisplay({
        organizationId: props.organizationEntityId.id,
        userId: userContext.apLoginUserDisplay.apEntityId.id,
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

  const DeveloperPortalViewUserApp_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
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
        command: DeveloperPortalViewUserApp_onNavigateHereCommand
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

  // const getWebhooksTabHeader = (): string => {
  //   const funcName = 'getWebhooksTabHeader';
  //   const logName = `${componentName}.${funcName}()`;
  //   if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);

  //   if(managedObjectDisplay.isAppWebhookCapable) {
  //     const numberWebhooks: number = APManagedWebhook.getNumberWebhooksDefined4App(managedObjectDisplay.apManagedWebhookList);
  //     return `Webhooks (${numberWebhooks})`;
  //   } else {
  //     return `Webhooks (N/A)`;
  //   }
  // }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="apd-app-view">
          <div className="apd-app-view-detail-left">
            <div><b>Status: </b>{mo.apAppStatus}</div>
            <div>TEST: connector status:{mo.devel_connectorAppResponses.smf.status}</div>
            {/* <div><b>Internal Name</b>: {managedObjectDisplay.apiAppResponse_smf.internalName}</div> */}

            <APDisplayDeveloperPortalAppApiProducts
              apDeveloperPortalApp_ApiProductDisplayList={mo.apDeveloperPortalUserApp_ApiProductDisplayList}
              className="p-mt-2 p-ml-2"
              emptyMessage="No API Products defined."
            />

          </div>
          <div className="apd-app-view-detail-right">
            <div>Id: {mo.apEntityId.id}</div>
          </div>            
        </div>
      </div>  
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    
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
              // apEnvironmentChannelPermissionsDisplayList={APAppEnvironmentsDisplayService.get_ApEnvironmentChannelPermissionsDisplayList({ apAppEnvironmentDisplayList: managedObject.apAppEnvironmentDisplayList })}
              collapsed={true}
              emptyMessage="No Channel Permissions found."
              componentTitle="Channel Permissions / Topics"
            />

            <APDisplayDeveloperPortalAppApiProductsClientInformationPanel
              apApp_ApiProduct_ClientInformationDisplayList={APDeveloperPortalAppApiProductsDisplayService.get_ApApp_ApiProduct_ClientInformationDisplayList({ apDeveloperPortalAppApiProductDisplayList: managedObject.apDeveloperPortalUserApp_ApiProductDisplayList })}
              collapsed={true}
              emptyMessage="No Client Informatin found."
              componentTitle="Client Information"
            />

          </TabPanel>
          <TabPanel header='Async API Specs'>
            <APDisplayDeveloperPortalAppAsyncApiSpecs
              organizationId={props.organizationEntityId.id}
              appId={props.appEntityId.id}
              apAppApiDisplayList={managedObject.apAppApiDisplayList}
              label="Double Click to view API"
              onError={props.onError}
              onLoadingChange={props.onLoadingChange}
            />
          </TabPanel>
          <TabPanel header="Webhooks">
            <p>TODO: rework APDisplayAppWebhooks</p>
            {/* <APDisplayAppWebhooks
              managedWebhookList={managedObjectDisplay.apManagedWebhookList}
              emptyMessage="Webhooks not supported by API Products / Environments."              
            /> */}
          </TabPanel>

          {/* <TabPanel header={getWebhooksTabHeader()}>
            <APDisplayAppWebhooks
              managedWebhookList={managedObjectDisplay.apManagedWebhookList}
              emptyMessage="Webhooks not supported by API Products / Environments."              
            />
          </TabPanel> */}
        </TabView>
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="apd-manage-user-apps">

        {managedObject && <APComponentHeader header={`App: ${managedObject.apEntityId.displayName}`} /> }

        <div className="p-mt-4 p-mb-4">
          <div>TODO: re-generate keys</div>
          <div>TODO: add products</div>

        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObject && renderManagedObject() }
      
      </div>

      {/* DEBUG */}
      {/* {managedObjectDisplay && 
        <div>
          <hr/>
          <div>managedObjectDisplay:</div>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectDisplay, null, 2)}
          </pre>
        </div>
      } */}
    </React.Fragment>
  );
}
