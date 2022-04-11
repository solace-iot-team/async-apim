
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { 
  ApiProductsService,
  AppConnectionStatus,
  AppResponse,
  AppsService,
  CommonDisplayName,
  CommonName,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APSUserId 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_MANAGE_USER_APP_COMPONENT_STATE } from "./deleteme.DeveloperPortalManageUserAppsCommon";
import { 
  APManagedUserAppDisplay,
  APManagedWebhook,
  TAPDeveloperPortalUserAppDisplay, 
  TAPOrganizationId 
} from "../../../components/APComponentsCommon";
import { EApiTopicSyntax, TApiProductList } from "../../../components/APApiObjectsCommon";
import { APDisplayAppEnvironments } from "../../../components/APDisplay/deleteme.APDisplayAppEnvironments";
import { APDisplayAppAsyncApis } from "../../../components/APDisplay/APDisplayAppAsyncApis";
import { APDisplayCredentialsPanel } from "../../../components/APDisplay/deleteme.APDisplayAppCredentialsPanel";
import { APDisplayClientInformationPanel } from "../../../components/APDisplay/APDisplayAppClientInformationPanel";
import { APDisplayAppWebhooks } from "../../../components/APDisplay/APDisplayAppWebhooks";

import '../../../components/APComponents.css';
import "./deleteme.DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalViewUserAppProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  appId: CommonName,
  appDisplayName: CommonDisplayName,
  onError: (apiCallState: TApiCallState) => void;
  onLoadingStart: () => void;
  onLoadingFinished: (managedUserAppDisplay: TAPDeveloperPortalUserAppDisplay) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (componentState: E_MANAGE_USER_APP_COMPONENT_STATE, appId: CommonName, appDisplayName: CommonDisplayName) => void;
}

export const DeveloperPortalViewUserApp: React.FC<IDeveloperPortalViewUserAppProps> = (props: IDeveloperPortalViewUserAppProps) => {
  const componentName = 'DeveloperPortalViewUserApp';

  type TManagedObjectDisplay = TAPDeveloperPortalUserAppDisplay;

  const [managedObjectDisplay, setManagedObjectDisplay] = React.useState<TManagedObjectDisplay>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve details for app: ${props.appDisplayName}`);
    try { 
      const _apiAppResponse_smf: AppResponse = await AppsService.getDeveloperApp({
        organizationName: props.organizationId, 
        developerUsername: props.userId, 
        appName: props.appId, 
        topicSyntax: EApiTopicSyntax.SMF
      });
      const _apiAppResponse_mqtt: AppResponse = await AppsService.getDeveloperApp({
        organizationName: props.organizationId, 
        developerUsername: props.userId, 
        appName: props.appId, 
        topicSyntax: EApiTopicSyntax.MQTT
      });
      const _apiAppConnectionStatus: AppConnectionStatus = await AppsService.getAppStatus({
        organizationName: props.organizationId,
        appName: props.appId
      });
      const _apiProductList: TApiProductList = [];

      // apiProducts: AppApiProducts = Array<(AppApiProductsComplex | CommonName)>;

      //   export declare type AppApiProductsComplex = {
      //     apiproduct: CommonName;
      //     status?: AppStatus;
      // };

      for(const apiAppApiProduct of _apiAppResponse_smf.apiProducts) {
        const apiApiProductId: string = (typeof apiAppApiProduct === 'string' ? apiAppApiProduct : apiAppApiProduct.apiproduct);
        const apiApiProduct = await ApiProductsService.getApiProduct({
          organizationName: props.organizationId,
          apiProductName: apiApiProductId
        });
        _apiProductList.push(apiApiProduct);
      }
      setManagedObjectDisplay(APManagedUserAppDisplay.createAPDeveloperPortalAppDisplayFromApiEntities(_apiAppResponse_smf, _apiProductList, _apiAppConnectionStatus, _apiAppResponse_mqtt));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const DeveloperPortalViewUserApp_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(E_MANAGE_USER_APP_COMPONENT_STATE.MANAGED_OBJECT_VIEW, props.appId, props.appDisplayName);
  }

  // * initialize *
  const doInitializeFinish = (mod: TManagedObjectDisplay) => {
    props.onLoadingFinished(mod);
  }
  const doInitializeStart = async () => {
    props.onLoadingStart();
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `App: ${props.appDisplayName}`,
      command: DeveloperPortalViewUserApp_onNavigateHereCommand
    }]);
    doInitializeStart();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectDisplay) doInitializeFinish(managedObjectDisplay);
  }, [managedObjectDisplay]); /* eslint-disable-line react-hooks/exhaustive-deps */
  

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const getWebhooksTabHeader = (): string => {
    const funcName = 'getWebhooksTabHeader';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);

    if(managedObjectDisplay.isAppWebhookCapable) {
      const numberWebhooks: number = APManagedWebhook.getNumberWebhooksDefined4App(managedObjectDisplay.apManagedWebhookList);
      return `Webhooks (${numberWebhooks})`;
    } else {
      return `Webhooks (N/A)`;
    }
  }

  const renderManagedObjectDisplay = () => {
    const funcName = 'renderManagedObjectDisplay';
    const logName = `${componentName}.${funcName}()`;
    
    // main
    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);
    if(!managedObjectDisplay.apiAppResponse_smf.environments) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_smf.environments is undefined`);
    if(!managedObjectDisplay.apiAppResponse_mqtt) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_mqtt is undefined`);
    if(!managedObjectDisplay.apiAppResponse_mqtt.environments) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_mqtt.environments is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="apd-app-view">
            <div className="apd-app-view-detail-left">
              <div><b>Status</b>: {managedObjectDisplay.apiAppResponse_smf.status}</div>
              {/* <div><b>Internal Name</b>: {managedObjectDisplay.apiAppResponse_smf.internalName}</div> */}

              <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
                <TabPanel header='General'>
                  <APDisplayCredentialsPanel
                    appCredentials={managedObjectDisplay.apiAppResponse_smf.credentials} 
                    header="Credentials"
                  />

                  <APDisplayAppEnvironments
                    appResponse_smf={managedObjectDisplay.apiAppResponse_smf}
                    appResponse_mqtt={managedObjectDisplay.apiAppResponse_mqtt}
                    // className="p-ml-2"
                  />

                  <APDisplayClientInformationPanel
                    appClientInformationList={managedObjectDisplay.apAppClientInformationList}
                    emptyMessage="No Client Information defined."
                    header='Client Information'
                  />

                </TabPanel>
                <TabPanel header='Async API Specs'>
                  <APDisplayAppAsyncApis 
                    organizationId={props.organizationId}
                    appId={props.appId}
                    appDisplayName={props.appDisplayName}
                    label="Click to view API"
                    onError={props.onError}
                    onLoadingChange={props.onLoadingChange}
                  />
                </TabPanel>
                <TabPanel header={getWebhooksTabHeader()}>
                  <APDisplayAppWebhooks
                    managedWebhookList={managedObjectDisplay.apManagedWebhookList}
                    emptyMessage="Webhooks not supported by API Products / Environments."              
                  />
                </TabPanel>
              </TabView>
            </div>
            <div className="apd-app-view-detail-right">
              <div>Id: {managedObjectDisplay.apiAppResponse_smf.name}</div>
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="apd-manage-user-apps">

        <APComponentHeader header={`App: ${props.appDisplayName}`} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObjectDisplay && renderManagedObjectDisplay() }
      
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
