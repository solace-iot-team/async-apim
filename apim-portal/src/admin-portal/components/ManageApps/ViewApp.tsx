
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

export interface IViewAppProps {
  organizationId: TAPOrganizationId,
  appId: string;
  appDisplayName: string;
  appType: AppListItem.appType;
  appOwnerId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
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
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderApiProducts = (apiProductList: TApiProductList): JSX.Element => {
    const rowExpansionTemplate = (rowData: TApiProduct) => {
      return (
        <div>
          <DataTable 
            className="p-datatable-sm"
            value={rowData.attributes}
            // autoLayout={true}
            sortMode="single" 
            sortField="name" 
            sortOrder={1}  
          >
            <Column 
              field="name" 
              header="Attribute Name" 
              bodyStyle={{ verticalAlign: 'top' }}
              style={{width: '30%'}}
              sortable
            />
            <Column 
              field="value" 
              header="Attribute Values"
              bodyStyle={{
                'overflow-wrap': 'break-word',
                'word-wrap': 'break-word'
              }} 
            />
          </DataTable>
        </div>
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
  
    const dataTableList = apiProductList;

    return (
      <div className="card">
        <DataTable
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
          <Column 
            field="displayName" 
            header="API Product" 
            bodyStyle={{ verticalAlign: 'top' }}
          />
          <Column body={attributesBodyTemplate} header="Attributes" bodyStyle={{ verticalAlign: 'top' }}/>
          <Column body={environmentsBodyTemplate} header="Environments" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
          <Column body={protocolsBodyTemplate} header="Protocols" bodyStyle={{ verticalAlign: 'top' }} />
        </DataTable>
      </div>
    )

  }

  const getOwnerDisplayStr = (managedObjectDisplay: TManagedObjectDisplay): string => {
    return `${managedObjectDisplay.apsUser.userId}`;
  }

  const renderOwnerDetails = (managedObjectDisplay: TManagedObjectDisplay): JSX.Element => {
    const profile = managedObjectDisplay.apsUser.profile;
    return(
      <Dialog 
        header={`User Id: ${getOwnerDisplayStr(managedObjectDisplay)}`} 
        visible={true} 
        position='top-right' 
        modal={false}
        style={{ width: '50vw' }} 
        onHide={()=> {setShowOwnerDetails(false)}}
        draggable={true} 
        resizable={true}
      >
        <div className="p-m-0">
          <div><b>First</b>: {profile.first}</div>
          <div><b>Last</b>: {profile.last}</div>
          <div><b>E-Mail</b>: {profile.email}</div>
          {/* DEBUG */}
          {/* <pre style={ { fontSize: '8px' }} >
           {JSON.stringify(managedObjectDisplay.apsUser, null, 2)};
           </pre> */}
        </div>
      </Dialog>
    );
  }

  const renderOwner = (managedObjectDisplay: TManagedObjectDisplay): JSX.Element => {
    const onOwnerClick = (event: any): void => {
      setShowOwnerDetails(true);
    }
    // main
    return (
      <Button
        label={getOwnerDisplayStr(managedObjectDisplay)}
        key={props.appOwnerId}
        data-id={props.appOwnerId}
        className="p-button-text p-button-plain" 
        style={{ whiteSpace: 'nowrap', padding: 'unset' }}          
        onClick={onOwnerClick}
      />
    );
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
              <div><b>Owner</b>: {renderOwner(managedObjectDisplay)} - TODO: for API Team, not user</div>
              <div><b>Internal Name</b>: {managedObjectDisplay.apiAppResponse_smf.internalName}</div>

              {/* APP Attributes */}
              <div className="p-text-bold">APP Attributes:</div>
              <APDisplayAttributes
                attributeList={managedObjectDisplay.apiAppResponse_smf.attributes}
                emptyMessage="No attributes defined"
                className="p-ml-4"
              />

              {/* APP Webhooks */}
              <div className="p-text-bold">APP Webhooks:</div>
              <div>TODO: display webhooks</div>

              {/* APP Credentials */}
              <div className="p-text-bold">APP Credentials:</div>
              <div>TODO: display credentials (for user, not for API Team)</div>

              {/* APP Endpoints & Permissions */}
              <div>{renderAppEnvironments(managedObjectDisplay.apiAppResponse_smf.environments, managedObjectDisplay.apiAppResponse_mqtt.environments)}</div>

              {/* App Client Information */}
              <Panel 
                headerTemplate={panelHeaderTemplateClientInformation} 
                toggleable
                collapsed={true}
                className="p-pt-2"
              >
                {/* DEBUG */}
                {/* <h1>managedObjectDisplay.apAppClientInformationList:</h1>
                <pre style={ { fontSize: '8px' }} >
                  {JSON.stringify(managedObjectDisplay.apAppClientInformationList, null, 2)}
                </pre> */}
                <APDisplayAppClientInformation 
                  appClientInformationList={managedObjectDisplay.apAppClientInformationList}
                  emptyMessage="No Client Information defined."
                  // className="p-ml-2"                
                />
              </Panel>

              {/* API Product */}
              <Panel 
                headerTemplate={panelHeaderTemplateApiProducts} 
                toggleable
                collapsed={true}
                className="p-pt-2"
              >
                <div className="p-ml-2">{renderApiProducts(managedObjectDisplay.apiProductList)}</div>
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
          <h1>ManagedObjectDisplay.apiAppResponse_smf.clientInformation:</h1>
          <pre style={ { fontSize: '8px' }} >
            {JSON.stringify(_d.apiAppResponse_smf.clientInformation, null, 2)}
          </pre>
        </div>
      );
    } else return (<></>);
  }

  return (
    <React.Fragment>
      <div className="manage-apps">

        <APComponentHeader header={`APP: ${props.appDisplayName}`} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObjectDisplay && renderManagedObjectDisplay() }

        {managedObjectDisplay && showOwnerDetails && renderOwnerDetails(managedObjectDisplay)}

      </div>
      {/* DEBUG */}
      {renderDebug()}
    </React.Fragment>
  );
}
