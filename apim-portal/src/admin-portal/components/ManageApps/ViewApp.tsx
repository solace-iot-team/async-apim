
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';
import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { Divider } from "primereact/divider";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { APDisplayDeveloperPortalAppApiProducts } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_ApiProducts";
import { APDisplayDeveloperPortalAppCredentialsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_Credentials_Panel";
import { APDisplayDeveloperPortalAppEndpointsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_Endpoints_Panel";
import APAppEnvironmentsDisplayService from "../../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { APDisplayDeveloperPortalAppEnvironmentChannelPermissionsPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_EnvironmentChannelPermissions_Panel";
import { APDisplayDeveloperPortalAppApiProductsClientInformationPanel } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalApp_ApiProducts_ClientInformation_Panel";
import APAdminPortalAppsDisplayService, { 
  TAPAdminPortalAppDisplay, 
  TAPAdminPortalAppDisplay_AllowedActions 
} from "../../displayServices/APAdminPortalAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";
import { APDisplayDeveloperPortalAppAsyncApiSpecs } from "../../../components/APDisplayDeveloperPortalApp/APDisplayDeveloperPortalAppAsyncApiSpecs";
import APDeveloperPortalAppApiProductsDisplayService from "../../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { APDisplayApAttributeDisplayList } from "../../../components/APDisplay/APDisplayApAttributeDisplayList";
import { Config } from "../../../Config";
import APAttributesDisplayService, { TAPAttributeDisplayList } from "../../../displayServices/APAttributesDisplayService/APAttributesDisplayService";
import { DisplayAppHeaderInfo } from "./DisplayAppHeaderInfo";
import { APDisplayAppWebhookList } from "../../../components/APDisplay/APDisplayAppWebhookList";
import { OrganizationContext } from "../../../components/APContextProviders/APOrganizationContextProvider";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IViewAppProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  setAllowedActions: (apAdminPortalAppDisplay_AllowedActions: TAPAdminPortalAppDisplay_AllowedActions) => void;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (appEntityId: TAPEntityId) => void;
}

export const ViewApp: React.FC<IViewAppProps> = (props: IViewAppProps) => {
  const ComponentName = 'ViewApp';

  type TManagedObject = TAPAdminPortalAppDisplay;

  const MessageNoWebhooksFound = 'No Webhooks configured.';

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [organizationContext] = React.useContext(OrganizationContext);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
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
    setApiCallStatus(callState);
    return callState;
  }

  const ViewApp_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
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
        command: ViewApp_onNavigateHereCommand
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
    props.setAllowedActions(APAdminPortalAppsDisplayService.get_AllowedActions({
        apAppDisplay: managedObject
    }));
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

  const renderDevelAttributeList = (mo: TManagedObject): JSX.Element => {
    const apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.create_ApAttributeDisplayList({ 
      apRawAttributeList: mo.devel_connectorAppResponses.smf.attributes ? mo.devel_connectorAppResponses.smf.attributes : []
    });
    return (
      <APDisplayApAttributeDisplayList
        apAttributeDisplayList={apAttributeDisplayList}
        tableRowHeader_AttributeName="Devel Attribute"
        tableRowHeader_AttributeValue="Value(s)"
        emptyMessage="No attributes defined"
        className="p-ml-4"
      />
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <React.Fragment>

        <DisplayAppHeaderInfo
          apAdminPortalAppDisplay={managedObject}
        />
      
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
            <APDisplayAppWebhookList
              organizationId={props.organizationId}
              apDeveloperPortalUserAppDisplay={managedObject}
              onError={props.onError}
              onLoadingChange={props.onLoadingChange}
              emptyMessage={MessageNoWebhooksFound}
            />
          </TabPanel>
          <TabPanel header="General Attributes">
            <React.Fragment>
              <div className="p-text-bold">General Attributes:</div>
              <APDisplayApAttributeDisplayList
                apAttributeDisplayList={managedObject.apCustom_ApAttributeDisplayList}
                tableRowHeader_AttributeName="App Attribute"
                tableRowHeader_AttributeValue="Value"  
                emptyMessage="No App Attributes defined."
                className="p-ml-4"
              />
              {Config.getUseDevelTools() &&
                <React.Fragment>
                  <Divider />
                  <div className="p-text-bold">DEVEL: All Attributes for cross checking:</div>
                  {renderDevelAttributeList(managedObject)}
                </React.Fragment>
              }
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
        <div className="ap-manage-apps">

        {managedObject && <APComponentHeader header={`App: ${managedObject.apEntityId.displayName}`} /> }

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
