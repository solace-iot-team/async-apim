
import React from "react";

import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';

import { 
  ApiProductsService, 
  AppEnvironment, 
  AppListItem, 
  AppResponse,
  AppsService
} from "@solace-iot-team/apim-connector-openapi-browser";
import { 
  APSUser, ApsUsersService
} from "@solace-iot-team/apim-server-openapi-browser";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { Globals } from "../../../utils/Globals";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPAppClientInformation, TAPAppClientInformationList, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { EApiTopicSyntax, TApiProduct, TApiProductList } from "../../../components/APApiObjectsCommon";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { APDisplayAttributes } from "../../../components/APDisplay/APDisplayAttributes";
import { APDisplayAppEnvironments } from "../../../components/APDisplay/APDisplayAppEnvironments";
import { APDisplayAppClientInformation } from "../../../components/APDisplay/APDisplayAppClientInformation";

import '../../../components/APComponents.css';
import "./ManageApps.css";
import { APDisplayOwner } from "../../../components/APDisplay/APDisplayOwner";
import { APDisplayAppAsyncApis } from "../../../components/APDisplay/APDisplayAppAsyncApis";
import { Divider } from "primereact/divider";
import { APDisplayAppWebhooks } from "../../../components/APDisplay/APDisplayAppWebhooks";
import { APDisplayAppCredentials } from "../../../components/APDisplay/APDisplayAppCredentials";

export interface IViewAppProps {
  organizationId: TAPOrganizationId,
  appId: string;
  appDisplayName: string;
  appType: AppListItem.appType;
  appOwnerId: string;  
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onLoadingFinished: (apiAppResponse: AppResponse) => void;
}

export const ViewApp: React.FC<IViewAppProps> = (props: IViewAppProps) => {
  const componentName = 'ViewApp';

  type TManagedObjectDisplay = {
    apiAppResponse_smf: AppResponse;
    apiAppResponse_mqtt: AppResponse;
    apiProductList: TApiProductList;
    apAppClientInformationList: TAPAppClientInformationList;
    apsUser: APSUser;
  }

  const createManagedObjectDisplay = (apiAppResponse_smf: AppResponse, apiAppResponse_mqtt: AppResponse, apiProductList: TApiProductList, apsUser: APSUser): TManagedObjectDisplay => {
    const funcName = 'createManagedObjectDisplay';
    const logName = `${componentName}.${funcName}()`;
    // add apiProductDisplayName to ClientInformation
    let _apAppClientInformationList: TAPAppClientInformationList = [];
    if(apiAppResponse_smf.clientInformation) {
      for (const ci of apiAppResponse_smf.clientInformation) {
        if(ci.guaranteedMessaging) {
          const found = apiProductList.find( (apiProduct: TApiProduct) => {
            return (apiProduct.name === ci.guaranteedMessaging?.apiProduct)
          });
          if(!found) throw new Error(`${logName}: could not find ci.guaranteedMessaging?.apiProduct=${ci.guaranteedMessaging?.apiProduct} in apiProductList=${JSON.stringify(apiProductList)}`);
          const _apAppClientInformation: TAPAppClientInformation = {
            guaranteedMessaging: ci.guaranteedMessaging,
            apiProductName: found.name,
            apiProductDisplayName: found.displayName
          }
          _apAppClientInformationList.push(_apAppClientInformation);
        }
      }
    }
    const managedObjectDisplay: TManagedObjectDisplay = {
      apiAppResponse_smf: apiAppResponse_smf,
      apiAppResponse_mqtt: apiAppResponse_mqtt,
      apiProductList: apiProductList,
      apAppClientInformationList: _apAppClientInformationList,
      apsUser: apsUser
    }
    return managedObjectDisplay;
  }

  const [managedObjectDisplay, setManagedObjectDisplay] = React.useState<TManagedObjectDisplay>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // API Products Data Table
  const viewProductsDataTableRef = React.useRef<any>(null);
  const [expandedViewProductsDataTableRows, setExpandedViewProductsDataTableRows] = React.useState<any>(null);
  // Owner
  const [showOwnerDetails, setShowOwnerDetails] = React.useState<boolean>();

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve app details: ${props.appDisplayName}`);
    try {
      let _apiAppResponse_smf: AppResponse | undefined = undefined;
      let _apiAppResponse_mqtt: AppResponse | undefined = undefined;
      switch(props.appType) {
        case AppListItem.appType.DEVELOPER: {
          _apiAppResponse_smf = await AppsService.getDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId,
            topicSyntax: EApiTopicSyntax.SMF
          });    
          _apiAppResponse_mqtt = await AppsService.getDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId,
            topicSyntax: EApiTopicSyntax.MQTT
          });     
        }
        break;
        case AppListItem.appType.TEAM: {
          _apiAppResponse_smf = await AppsService.getTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId,
            appName: props.appId,
            topicSyntax: EApiTopicSyntax.SMF
          });
          _apiAppResponse_mqtt = await AppsService.getTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId,
            appName: props.appId,
            topicSyntax: EApiTopicSyntax.MQTT
          });
        }
        break;
        default:
          Globals.assertNever(logName, props.appType);
      }
      if(!_apiAppResponse_smf) throw new Error(`${logName}: _apiAppResponse_smf is undefined`);
      if(!_apiAppResponse_mqtt) throw new Error(`${logName}: _apiAppResponse_mqtt is undefined`);
      let _apiProductList: TApiProductList = [];
      for(const apiApiProductId of _apiAppResponse_smf.apiProducts) {
        const apiApiProduct = await ApiProductsService.getApiProduct({
          organizationName: props.organizationId,
          apiProductName: apiApiProductId
        });
        _apiProductList.push(apiApiProduct);
      }
      let _apsUser: APSUser | undefined = undefined;
      try {
        _apsUser = await ApsUsersService.getApsUser({
          userId: props.appOwnerId
        });
      } catch(e: any) {
        APSClientOpenApi.logError(logName, e);
        callState = ApiCallState.addErrorToApiCallState(e, callState);
        throw(e);
      }
      if(!_apsUser) throw new Error(`${logName}: _apsUser is undefined`);
      setManagedObjectDisplay(createManagedObjectDisplay(_apiAppResponse_smf, _apiAppResponse_mqtt, _apiProductList, _apsUser));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      if(apiCallStatus.success && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_GET_APP) {
        if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);
        props.onLoadingFinished(managedObjectDisplay.apiAppResponse_smf);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
    )

  }

  const renderAppEnvironments = (appEnvironmentList_smf: Array<AppEnvironment>, appEnvironmentList_mqtt: Array<AppEnvironment>): JSX.Element => {
    return (
      <React.Fragment>
        <APDisplayAppEnvironments
          appEnvironmentList_smf={appEnvironmentList_smf}
          appEnvironmentList_mqtt={appEnvironmentList_mqtt}
          // className="p-ml-2"
        />
      </React.Fragment>  
    );
  }

  const renderManagedObjectDisplay = () => {
    const funcName = 'renderManagedObjectDisplay';
    const logName = `${componentName}.${funcName}()`;
    
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
    const panelHeaderTemplateClientInformation = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            APP Client Information
          </span>
        </div>
      );
    }
    const panelHeaderTemplateWebhooks = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            APP Webhooks
          </span>
        </div>
      );
    }
    const panelHeaderTemplateCredentials     = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            APP Credentials
          </span>
        </div>
      );
    }    
    const panelHeaderTemplateAppAttributes = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            APP Attributes
          </span>
        </div>
      );
    }
    const panelHeaderTemplateAppApis = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            APP APIs
          </span>
        </div>
      );
    }
    // main
    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);
    if(!managedObjectDisplay.apiAppResponse_smf.environments) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_smf.environments is undefined`);
    if(!managedObjectDisplay.apiAppResponse_mqtt.environments) throw new Error(`${logName}: managedObjectDisplay.apiAppResponse_mqtt.environments is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="ap-app-view">
            <div className="ap-app-view-detail-left">
              {/* <div className="p-text-bold">Description:</div>
              <div className="p-ml-2">{managedObjectDisplay.apiProduct.description}</div> */}
              <div><b>Status</b>: {managedObjectDisplay.apiAppResponse_smf.status}</div>
              <div><b>Type</b>: {props.appType}</div>
              <APDisplayOwner 
                label='Owner'
                ownerId={props.appOwnerId}
                ownerType={props.appType === AppListItem.appType.DEVELOPER ? 'apsUser' : 'apsTeam'}
                apsUser={managedObjectDisplay.apsUser}
                className='xx'
              />
              <div><b>Internal Name</b>: {managedObjectDisplay.apiAppResponse_smf.internalName}</div>

              {/* APP Attributes */}
              <Panel 
                headerTemplate={panelHeaderTemplateAppAttributes} 
                toggleable
                collapsed={false}
                className="p-pt-2"
              >
                <APDisplayAttributes
                  attributeList={managedObjectDisplay.apiAppResponse_smf.attributes}
                  emptyMessage="No attributes defined."
                  // className="p-ml-4"
                />
              </Panel>

              {/* App Apis */}
              <Panel 
                headerTemplate={panelHeaderTemplateAppApis} 
                toggleable
                collapsed={true}
                className="p-pt-2"
              >
                <APDisplayAppAsyncApis 
                  organizationId={props.organizationId}
                  appId={props.appId}
                  appDisplayName={props.appDisplayName}
                  label="Click to view API"
                  onError={props.onError}
                  onLoadingChange={props.onLoadingChange}
                />
              </Panel>

              {/* APP Webhooks */}
              <Panel 
                headerTemplate={panelHeaderTemplateWebhooks} 
                toggleable
                collapsed={true}
                className="p-pt-2"
              >
                <APDisplayAppWebhooks 
                  appWebhookList={managedObjectDisplay.apiAppResponse_smf.webHooks ? managedObjectDisplay.apiAppResponse_smf.webHooks : []} 
                  emptyMessage="No Webhooks defined."              
                />
              </Panel>

              {/* APP Credentials */}
              <Panel 
                headerTemplate={panelHeaderTemplateCredentials} 
                toggleable
                collapsed={true}
                className="p-pt-2"
              >
                <APDisplayAppCredentials
                  appCredentials={managedObjectDisplay.apiAppResponse_smf.credentials} 
                />
              </Panel>

              {/* APP Endpoints & Permissions */}
              <div>{renderAppEnvironments(managedObjectDisplay.apiAppResponse_smf.environments, managedObjectDisplay.apiAppResponse_mqtt.environments)}</div>

              {/* App Client Information */}
              <Panel 
                headerTemplate={panelHeaderTemplateClientInformation} 
                toggleable
                collapsed={true}
                className="p-pt-2"
              >
                <APDisplayAppClientInformation 
                  appClientInformationList={managedObjectDisplay.apAppClientInformationList}
                  emptyMessage="No Client Information defined."
                  // className="p-ml-2"                
                />
              </Panel>
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
            <div className="ap-app-view-detail-right">
              <div>Id: {managedObjectDisplay.apiAppResponse_smf.name}</div>
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  const renderDebug = (): JSX.Element => {
    if(managedObjectDisplay) {
      const _d = {
        ...managedObjectDisplay,
        globalSearch: 'not shown...'
      }
      return (
        <div>
          <hr/>
          <h1>ManagedObjectDisplay.apiAppResponse_smf.credentials:</h1>
          <pre style={ { fontSize: '8px' }} >
            {JSON.stringify(_d.apiAppResponse_smf.credentials, null, 2)}
          </pre>
        </div>
      );
    } else return (<></>);
  }

  return (
    <React.Fragment>
      <div className="ap-manage-apps">

        <APComponentHeader header={`APP: ${props.appDisplayName}`} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObjectDisplay && renderManagedObjectDisplay() }

      </div>
      {/* DEBUG */}
      {/* {renderDebug()} */}
    </React.Fragment>
  );
}
