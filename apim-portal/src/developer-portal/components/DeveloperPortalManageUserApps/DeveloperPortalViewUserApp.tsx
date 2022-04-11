
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
// import { EApiTopicSyntax, TApiProductList } from "../../../components/APApiObjectsCommon";
import { APDisplayAppEnvironments } from "../../../components/APDisplay/deleteme.APDisplayAppEnvironments";
import { APDisplayAppAsyncApis } from "../../../components/APDisplay/APDisplayAppAsyncApis";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageUserAppsCommon";
import { APDisplayDeveloperPortalApp_ApiProducts } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_ApiProducts";
import { APDisplayDeveloperPortalApp_Credentials_Panel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_Credentials_Panel";

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
            <div><b>Status: </b>{mo.appStatus}</div>
            {/* <div><b>Internal Name</b>: {managedObjectDisplay.apiAppResponse_smf.internalName}</div> */}

            <APDisplayDeveloperPortalApp_ApiProducts
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
    if(managedObject.devel_connectorAppResponses.mqtt === undefined) throw new Error(`${logName}: managedObject.devel_connectorAppResponses.mqtt === undefined`);
    // if(!managedObjectDisplay.apiAppResponse_mqtt) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_mqtt is undefined`);
    // if(!managedObjectDisplay.apiAppResponse_mqtt.environments) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_mqtt.environments is undefined`);
    return (
      <React.Fragment>

        {renderHeader(managedObject)}

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General'>

                  <APDisplayDeveloperPortalApp_Credentials_Panel
                    appCredentials={managedObject.appCredentials}
                    componentTitle="Credentials"
                    collapsed={true}
                  />

                  {/* <APDisplayDeveloperPortalApp_Endpoints_Panel
                  
                  /> */}
                  <APDisplayAppEnvironments
                    appResponse_smf={managedObject.devel_connectorAppResponses.smf}
                    appResponse_mqtt={managedObject.devel_connectorAppResponses.mqtt}
                    // className="p-ml-2"
                  />

                  <p>TODO: APDisplayClientInformationPanel</p>
                  {/* <APDisplayClientInformationPanel
                    appClientInformationList={managedObject.apAppClientInformationList}
                    emptyMessage="No Client Information defined."
                    header='Client Information'
                  /> */}
          </TabPanel>
          <TabPanel header='Async API Specs'>
            <p>TODO: rework APDisplayAppAsyncApis</p>
            <APDisplayAppAsyncApis 
              organizationId={props.organizationEntityId.id}
              appId={props.appEntityId.id}
              appDisplayName={props.appEntityId.displayName}
              label="Click to view API"
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

        <APComponentHeader header={`App: ${props.appEntityId.displayName}`} />

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
