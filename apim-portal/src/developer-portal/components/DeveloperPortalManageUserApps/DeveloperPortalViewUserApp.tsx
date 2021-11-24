
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { 
  ApiProductsService,
  AppEnvironment,
  AppResponse,
  AppsService,
  CommonDisplayName,
  CommonName,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APSUserId } from "@solace-iot-team/apim-server-openapi-browser";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_MANAGE_USER_APP_COMPONENT_STATE } from "./DeveloperPortalManageUserAppsCommon";
import { 
  APManagedUserAppDisplay,
  APManagedWebhook,
  TAPDeveloperPortalUserAppDisplay, 
  TAPOrganizationId 
} from "../../../components/APComponentsCommon";
import { EApiTopicSyntax, TApiProduct, TApiProductList } from "../../../components/APApiObjectsCommon";
import { APDisplayAppEnvironments } from "../../../components/APDisplay/APDisplayAppEnvironments";
import { APDisplayAttributes } from "../../../components/APDisplay/APDisplayAttributes";
import { APDisplayAppAsyncApis } from "../../../components/APDisplay/APDisplayAppAsyncApis";
import { APDisplayAppCredentials } from "../../../components/APDisplay/APDisplayAppCredentials";
import { APDisplayAppClientInformation } from "../../../components/APDisplay/APDisplayAppClientInformation";
import { APDisplayAppWebhooksPanel } from "../../../components/APDisplay/APDisplayAppWebhooksPanel";
import { APRenderUtils } from "../../../utils/APRenderUtils";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";
import { APDisplayCredentialsPanel } from "../../../components/APDisplay/APDisplayAppCredentialsPanel";
import { APDisplayClientInformationPanel } from "../../../components/APDisplay/APDisplayAppClientInformationPanel";
import { APDisplayAppWebhooks } from "../../../components/APDisplay/APDisplayAppWebhooks";

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
  // tabs
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
      let _apiProductList: TApiProductList = [];
      for(const apiApiProductId of _apiAppResponse_smf.apiProducts) {
        const apiApiProduct = await ApiProductsService.getApiProduct({
          organizationName: props.organizationId,
          apiProductName: apiApiProductId
        });
        _apiProductList.push(apiApiProduct);
      }
      setManagedObjectDisplay(APManagedUserAppDisplay.createAPDeveloperPortalAppDisplayFromApiEntities(_apiAppResponse_smf, _apiProductList, _apiAppResponse_mqtt));
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


  // TODO: create a new component: APDisplayAppAPIProductReferences
  // TODO: use also in Admin Portal: ManageUserApps:ViewApp
  const viewProductsDataTableRef = React.useRef<any>(null);
  const [expandedViewProductsDataTableRows, setExpandedViewProductsDataTableRows] = React.useState<any>(null);
  const renderApiProducts = (apiProductList: TApiProductList): JSX.Element => {
    const rowExpansionTemplate = (rowData: TApiProduct) => {
      return (
        <APDisplayAttributes
          attributeList={rowData.attributes}
          emptyMessage="No attributes defined."
        />
      );
    }
    const environmentsBodyTemplate = (rowData: TApiProduct): JSX.Element => {
      return APRenderUtils.renderStringListAsDivList(rowData.environments ? rowData.environments : []);
    }  
    const protocolsBodyTemplate = (rowData: TApiProduct): JSX.Element => {
      return (
        <React.Fragment>
          {APRenderUtils.getProtocolListAsString(rowData.protocols)}
        </React.Fragment>
      );
    }
    const attributesBodyTemplate = (rowData: TApiProduct): JSX.Element => {
      return APRenderUtils.renderStringListAsDivList(APRenderUtils.getAttributeNameList(rowData.attributes));
    }
    const apisBodyTemplate = (rowData: TApiProduct): JSX.Element => {
      return APRenderUtils.renderStringListAsDivList(rowData.apis);
    }    
    const apiProductNameBodyTemplate = (rowData: TApiProduct): JSX.Element => {
      return (
        <div className="p-text-bold">{rowData.displayName}</div>
      );
    }

    const dataTableList = apiProductList;

    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={viewProductsDataTableRef}
          dataKey="name"
          value={dataTableList}
          sortMode="single" 
          sortField="name" 
          sortOrder={1}
          scrollable 
          // scrollHeight="200px" 
          expandedRows={expandedViewProductsDataTableRows}
          onRowToggle={(e) => setExpandedViewProductsDataTableRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column expander style={{ width: '3em' }} />  
          <Column body={apiProductNameBodyTemplate} header="API Product" bodyStyle={{ verticalAlign: 'top' }} />
          <Column body={apisBodyTemplate} header="APIs" bodyStyle={{ verticalAlign: 'top' }}/>
          <Column body={attributesBodyTemplate} header="Attributes" bodyStyle={{ verticalAlign: 'top' }}/>
          <Column body={environmentsBodyTemplate} header="Environments" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
          <Column body={protocolsBodyTemplate} header="Protocols" bodyStyle={{ verticalAlign: 'top' }} />
        </DataTable>
      </div>
    );
  }

    const panelHeaderTemplateApiProducts = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            API Products
          </span>
        </div>
      );
    }

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
              {/* <div className="p-text-bold">TODO:</div>
              <div className="p-ml-2">re-imagine this view for developer needs: connect, pub/sub, queue, ...</div> */}
              <div><b>Status</b>: {managedObjectDisplay.apiAppResponse_smf.status}</div>
              <div><b>Internal Name</b>: {managedObjectDisplay.apiAppResponse_smf.internalName}</div>

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

              {/* References */}
              <Divider />
              <div><b>References:</b></div>
              {/* API Product */}
              <Panel                 
                headerTemplate={panelHeaderTemplateApiProducts} 
                toggleable
                collapsed={true}
                className="p-pt-2"
              >
                <div>{renderApiProducts(managedObjectDisplay.apiProductList)}</div>
              </Panel>
            </div>
            <div className="apd-app-view-detail-right">
              <div>Id: {managedObjectDisplay.apiAppResponse_smf.name}</div>
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  
  // const renderManagedObjectDisplay = () => {
  //   const funcName = 'renderManagedObjectDisplay';
  //   const logName = `${componentName}.${funcName}()`;
    
  //   const panelHeaderTemplateApiProducts = (options: PanelHeaderTemplateOptions) => {
  //     const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
  //     const className = `${options.className} p-jc-start`;
  //     const titleClassName = `${options.titleClassName} p-pl-1`;
  //     return (
  //       <div className={className} style={{ justifyContent: 'left'}} >
  //         <button className={options.togglerClassName} onClick={options.onTogglerClick}>
  //           <span className={toggleIcon}></span>
  //         </button>
  //         <span className={titleClassName}>
  //           API Products
  //         </span>
  //       </div>
  //     );
  //   }
  //   const panelHeaderTemplateClientInformation = (options: PanelHeaderTemplateOptions) => {
  //     const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
  //     const className = `${options.className} p-jc-start`;
  //     const titleClassName = `${options.titleClassName} p-pl-1`;
  //     return (
  //       <div className={className} style={{ justifyContent: 'left'}} >
  //         <button className={options.togglerClassName} onClick={options.onTogglerClick}>
  //           <span className={toggleIcon}></span>
  //         </button>
  //         <span className={titleClassName}>
  //           APP Client Information
  //         </span>
  //       </div>
  //     );
  //   }
  //   const panelHeaderTemplateCredentials = (options: PanelHeaderTemplateOptions) => {
  //     const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
  //     const className = `${options.className} p-jc-start`;
  //     const titleClassName = `${options.titleClassName} p-pl-1`;
  //     return (
  //       <div className={className} style={{ justifyContent: 'left'}} >
  //         <button className={options.togglerClassName} onClick={options.onTogglerClick}>
  //           <span className={toggleIcon}></span>
  //         </button>
  //         <span className={titleClassName}>
  //           APP Credentials
  //         </span>
  //       </div>
  //     );
  //   }    
  //   const panelHeaderTemplateAppAttributes = (options: PanelHeaderTemplateOptions) => {
  //     const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
  //     const className = `${options.className} p-jc-start`;
  //     const titleClassName = `${options.titleClassName} p-pl-1`;
  //     return (
  //       <div className={className} style={{ justifyContent: 'left'}} >
  //         <button className={options.togglerClassName} onClick={options.onTogglerClick}>
  //           <span className={toggleIcon}></span>
  //         </button>
  //         <span className={titleClassName}>
  //           APP Attributes
  //         </span>
  //       </div>
  //     );
  //   }
  //   const panelHeaderTemplateAppApis = (options: PanelHeaderTemplateOptions) => {
  //     const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
  //     const className = `${options.className} p-jc-start`;
  //     const titleClassName = `${options.titleClassName} p-pl-1`;
  //     return (
  //       <div className={className} style={{ justifyContent: 'left'}} >
  //         <button className={options.togglerClassName} onClick={options.onTogglerClick}>
  //           <span className={toggleIcon}></span>
  //         </button>
  //         <span className={titleClassName}>
  //           APP APIs
  //         </span>
  //       </div>
  //     );
  //   }
  //   // main
  //   if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);
  //   if(!managedObjectDisplay.apiAppResponse_smf.environments) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_smf.environments is undefined`);
  //   if(!managedObjectDisplay.apiAppResponse_mqtt) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_mqtt is undefined`);
  //   if(!managedObjectDisplay.apiAppResponse_mqtt.environments) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_mqtt.environments is undefined`);
  //   return (
  //     <React.Fragment>
  //       <div className="p-col-12">
  //         <div className="apd-app-view">
  //           <div className="apd-app-view-detail-left">
  //             <div className="p-text-bold">TODO:</div>
  //             <div className="p-ml-2">re-imagine this view for developer needs: connect, pub/sub, queue, ...</div>
  //             {/* <div className="p-text-bold">Description:</div> */}
  //             {/* <div className="p-ml-2">{managedObjectDisplay.apiAppResponse_smf.des}</div> */}
  //             <div><b>Status</b>: {managedObjectDisplay.apiAppResponse_smf.status}</div>
  //             <div><b>Internal Name</b>: {managedObjectDisplay.apiAppResponse_smf.internalName}</div>

  //             {/* APP Attributes */}
  //             <Panel 
  //               headerTemplate={panelHeaderTemplateAppAttributes} 
  //               toggleable
  //               collapsed={true}
  //               className="p-pt-2"
  //             >
  //               <APDisplayAttributes
  //                 attributeList={managedObjectDisplay.apiAppResponse_smf.attributes}
  //                 emptyMessage="No attributes defined."
  //               />
  //             </Panel>

  //             {/* App Apis */}
  //             <Panel 
  //               headerTemplate={panelHeaderTemplateAppApis} 
  //               toggleable
  //               collapsed={true}
  //               className="p-pt-2"
  //             >
  //               <APDisplayAppAsyncApis 
  //                 organizationId={props.organizationId}
  //                 appId={props.appId}
  //                 appDisplayName={props.appDisplayName}
  //                 label="Click to view API"
  //                 onError={props.onError}
  //                 onLoadingChange={props.onLoadingChange}
  //               />
  //             </Panel>

  //             {/* App Webhooks */}
  //             <APDisplayAppWebhooksPanel
  //               isAppWebhooksCapable={managedObjectDisplay.isAppWebhookCapable}
  //               managedWebhookList={managedObjectDisplay.apManagedWebhookList}
  //               emptyMessage="No Webhooks defined."              
  //             />

  //             {/* APP Credentials */}
  //             <Panel 
  //               headerTemplate={panelHeaderTemplateCredentials} 
  //               toggleable
  //               collapsed={true}
  //               className="p-pt-2"
  //             >
  //               <APDisplayAppCredentials
  //                 appCredentials={managedObjectDisplay.apiAppResponse_smf.credentials} 
  //               />
  //             </Panel>

  //             {/* APP Endpoints & Permissions */}
  //             <div>{renderAppEnvironments(managedObjectDisplay.apiAppResponse_smf.environments, managedObjectDisplay.apiAppResponse_mqtt.environments)}</div>

  //             {/* App Client Information */}
  //             <Panel 
  //               headerTemplate={panelHeaderTemplateClientInformation} 
  //               toggleable
  //               collapsed={true}
  //               className="p-pt-2"
  //             >
  //               <APDisplayAppClientInformation 
  //                 appClientInformationList={managedObjectDisplay.apAppClientInformationList}
  //                 emptyMessage="No Client Information defined."
  //                 // className="p-ml-2"                
  //               />
  //             </Panel>
  //             {/* References */}
  //             <Divider />
  //             <div><b>References:</b></div>
  //             {/* API Product */}
  //             <Panel                 
  //               headerTemplate={panelHeaderTemplateApiProducts} 
  //               toggleable
  //               collapsed={true}
  //               className="p-pt-2"
  //             >
  //               <div>{renderApiProducts(managedObjectDisplay.apiProductList)}</div>
  //             </Panel>
  //           </div>
  //           <div className="apd-app-view-detail-right">
  //             <div>Id: {managedObjectDisplay.apiAppResponse_smf.name}</div>
  //           </div>            
  //         </div>
  //       </div>  
  //     </React.Fragment>
  //   ); 
  // }


  return (
    <React.Fragment>
      <div className="apd-manage-user-apps">

        <APComponentHeader header={`App: ${props.appDisplayName}`} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObjectDisplay && renderManagedObjectDisplay() }
      
      </div>

      {/* DEBUG */}
      {managedObjectDisplay && 
        <div>
          <hr/>
          <div>managedObjectDisplay:</div>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectDisplay, null, 2)}
          </pre>
        </div>
      }
    </React.Fragment>
  );
}
