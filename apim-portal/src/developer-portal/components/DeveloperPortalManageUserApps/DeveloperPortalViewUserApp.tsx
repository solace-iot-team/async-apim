
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import { 
  App,
  AppResponse,
  AppsService,
  WebHook
} from '@solace-iot-team/platform-api-openapi-client-fe';
import { APSUserId } from "@solace-iot-team/apim-server-openapi-browser";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  E_CALL_STATE_ACTIONS, 
  DeveloperPortalManageUserAppsCommon, 
  TManagedObjectId, 
  TViewManagedObject 
} from "./DeveloperPortalManageUserAppsCommon";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalViewUserAppProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  appId: string,
  appDisplayName: string,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalViewUserApp: React.FC<IDeveloperPortalViewUserAppProps> = (props: IDeveloperPortalViewUserAppProps) => {
  const componentName = 'DeveloperPortalViewUserApp';

  type TViewApiObject = AppResponse;

  type TViewManagedObject = {
    id: TManagedObjectId,
    displayName: string,
    apiObject: TViewApiObject,
  }

  type TManagedObject = TViewManagedObject;

  const transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject): TViewManagedObject => {
    return {
      id: viewApiObject.name,
      displayName: viewApiObject.displayName ? viewApiObject.displayName : viewApiObject.name,
      apiObject: viewApiObject,
    }
  }

  // /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  // const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext); 
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve details for app: ${props.appDisplayName}`);
    try { 
      const apiUserApp: AppResponse = await AppsService.getDeveloperApp(props.organizationId, props.userId, props.appId, "smf");
      setManagedObject(transformViewApiObjectToViewManagedObject(apiUserApp));
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

  // const renderManagedObject = () => {
  //   const funcName = 'renderManagedObject';
  //   const logName = `${componentName}.${funcName}()`;
  //   if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
  //   const dataTableList = [managedObject];

  //   return (
  //     <div className="card">
  //       <DataTable
  //         ref={dt}
  //         autoLayout={true}
  //         // header={'UserId: ' + managedObject.apiObject.userId}
  //         value={dataTableList}
  //         dataKey="id"
  //         >
  //           <Column field="isActive" header="Activated?" headerStyle={{width: '9em', textAlign: 'center'}} bodyStyle={{textAlign: 'center' }} body={ManageUsersCommon.isActiveBodyTemplate} sortable filterField="globalSearch" />
  //           <Column field="apiObject.profile.email" header="E-Mail" sortable />
  //           <Column field="roleDisplayNameListAsString" header="Roles" />
  //           <Column field="memberOfOrganizationNameListAsString" header="Organizations" />
  //           <Column field="apiObject.profile.first" header="First Name" sortable />
  //           <Column field="apiObject.profile.last" header="Last Name" sortable />
  //       </DataTable>
  //     </div>
  //   )
  // }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    
    // const managedObjectDisplay: TViewManagedObject = transformManagedObjectToDisplay(managedObject);

    // const renderShowApiButtons = () => {
    //   let jsxButtonList: Array<JSX.Element> = [];
    //   for (const apiId of managedObject.apiObject.apis) {
    //     jsxButtonList.push(
    //       <Button label={apiId} key={apiId} data-id={apiId} icon="pi pi-folder-open" className="p-button-text p-button-plain p-button-outlined" onClick={onShowApi}/>        
    //     );
    //   }
    //   return (
    //     <Toolbar className="p-mb-4 product-api-toolbar" style={{ width: '10rem' }} left={jsxButtonList} />
    //   );
    // }

    // const renderAttributesInfo = (attributeList?: Array<TApiAttribute>): JSX.Element => {
    //   let attributesJSXElementList: Array<JSX.Element> = [];
      
    //   const addAttributeJSXElement = (attribute: TApiAttribute) => {
    //     const jsxElem: JSX.Element = (
    //       <li>
    //         {attribute.name}: [{attribute.value}]
    //       </li>
    //     );
    //     attributesJSXElementList.push(jsxElem);
    //   }

    //   if(attributeList) {
    //     attributeList.forEach( (attribute: TApiAttribute) => {
    //       addAttributeJSXElement(attribute);  
    //     });
    //     return (
    //       <div>
    //         Controlled Attributes: 
    //         <ul style={{ "listStyle": "disc", "padding": "0px 0px 0px 30px" }}>
    //           {attributesJSXElementList}
    //         </ul>
    //       </div>
    //     );
    //   }
    //   else return (
    //     <div>
    //       Controlled Attributes: none.
    //     </div>
    //   );
    // }
  
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="api-userapp-view">
            {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
            <div className="api-userapp-view-detail">
              {/* <div className="api-product-name">{props.apiProductDisplayName}</div> */}
              {/* <div className="api-userapp-description">{managedObject.apiObject.description}</div> */}
              <div className="api-userapp-app-id">Id: {managedObject.apiObject.name}</div>
              <div>Status: {managedObject.apiObject.status}</div>
              {/* <div>Gateways: {managedObjectDisplay.environmentListAsString}</div>
              <div>Protocols: {managedObjectDisplay.protocolListAsString}</div> */}
              {/* {renderAttributesInfo(managedObject.apiObject.attributes)} */}
              {/* <i className="pi pi-tag product-category-icon"></i><span className="product-category">{data.category}</span> */}
              <div className="api-product-apis">Async API Spec(s):</div>
              {/* {renderShowApiButtons()} */}
            </div>
            <div className="api-product-action">
              <div>any info here?</div>
              {/* <Rating value={4} readOnly cancel={false}></Rating> */}
                {/* <span className="api-product-apis">Async API Spec(s)</span> */}
                {/* <span>{JSON.stringify(managedObjectDisplay.apiObject.apis)}</span> */}

                {/* <Button icon="pi pi-shopping-cart" label="Add to Cart" disabled={data.inventoryStatus === 'OUTOFSTOCK'}></Button>
                <span className={`product-badge status-${data.inventoryStatus.toLowerCase()}`}>{data.inventoryStatus}</span> */}
            </div>            
          </div>
        </div>  
        <hr/> 
        <div>TODO: button to show API Spec</div> 
        {/* {apiSpec && showApiId &&
          <APDisplayAsyncApiSpec schema={apiSpec} schemaId={showApiId} />
        } */}
      </React.Fragment>
    ); 
  }

  return (
    <div className="apd-manageuserapps">

      <APComponentHeader header={`App: ${props.appDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

      {/* DEBUG selected managedObject */}
      {managedObject && 
        <div>
          <hr/>
          <div>app details:</div>
          <pre style={ { fontSize: '12px' }} >
            {JSON.stringify(managedObject, null, 2)}
          </pre>
        </div>
      }

    </div>
  );
}
