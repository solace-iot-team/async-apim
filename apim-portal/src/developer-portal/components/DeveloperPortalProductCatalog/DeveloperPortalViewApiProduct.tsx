
import React from "react";

import { Rating } from 'primereact/rating';
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";

import { 
  ApiProductsService, 
  APIProduct, 
  ApisService,
  EnvironmentResponse,
  EnvironmentsService
} from '@solace-iot-team/platform-api-openapi-client-fe';

import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  DeveloperPortalCatgalogCommon, 
  E_CALL_STATE_ACTIONS, 
  TManagedObjectId, 
  TViewManagedObject
} from "./DeveloperPortalProductCatalogCommon";

import { 
  DeveloperPortalCommon,
  TApiAttribute, 
} from "../DeveloperPortalCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";

export interface IDeveloperPortalViewapiProductProps {
  organizationId: TAPOrganizationId;
  apiProductId: TManagedObjectId;
  apiProductDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalViewApiProduct: React.FC<IDeveloperPortalViewapiProductProps> = (props: IDeveloperPortalViewapiProductProps) => {
  const componentName = 'DeveloperPortalViewApiProduct';

  type TManagedObject = TViewManagedObject;
  type TManagedObjectDisplay = TManagedObject & {
    protocolListAsString: string,
    attributeInfoAsString: string,
    environmentListAsString: string
  }

  const transformManagedObjectToDisplay = (managedObject: TManagedObject): TManagedObjectDisplay => {
    return {
      ...managedObject,
      protocolListAsString: DeveloperPortalCommon.getProtocolListAsString(managedObject.apiObject.protocols),
      attributeInfoAsString: DeveloperPortalCommon.getAttributeInfoAsString(managedObject.apiObject.attributes),
      environmentListAsString: DeveloperPortalCommon.getEnvironmentsAsString(managedObject.apiEnvironmentList, managedObject.apiObject.environments)
    }
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showApiId, setShowApiId] = React.useState<string>();
  const [apiSpec, setApiSpec] = React.useState<any>();

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT, `retrieve details for product: ${props.apiProductDisplayName}`);
    try { 
      const apiProduct: APIProduct = await ApiProductsService.getApiProduct(props.organizationId, props.apiProductId);
      let apiEnvironmentList: Array<EnvironmentResponse> = [];
      if(apiProduct.environments) {
        for(const apiEnvironmentName of apiProduct.environments) {
          const resp: EnvironmentResponse = await EnvironmentsService.getEnvironment(props.organizationId, apiEnvironmentName);
          apiEnvironmentList.push(resp);
        }
      }
      setManagedObject(DeveloperPortalCatgalogCommon.transformViewApiObjectToViewManagedObject(apiProduct, apiEnvironmentList));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetApi = async(apiId: string, apiDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetApi';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve api spec: ${apiDisplayName}`);
    try { 
      const api: any = await ApisService.getApi(props.organizationId, apiId, "application/json");
      setApiSpec(api);
    } catch(e) {
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

  const doFetchApi = async (apiId: string) => {
    props.onLoadingChange(true);
    await apiGetApi(apiId, apiId);
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

  React.useEffect(() => {
    if(showApiId) doFetchApi(showApiId);
  }, [showApiId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onShowApi = (event: any): void => {
    const funcName = 'onShowApi';
    const logName = `${componentName}.${funcName}()`;
    console.log(`${logName}: event.currentTarget.dataset.id=${JSON.stringify(event.currentTarget.dataset.id, null, 2)}`);
    setShowApiId(event.currentTarget.dataset.id);
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    
    const managedObjectDisplay: TManagedObjectDisplay = transformManagedObjectToDisplay(managedObject);

    const renderShowApiButtons = () => {
      let jsxButtonList: Array<JSX.Element> = [];
      for (const apiId of managedObject.apiObject.apis) {
        jsxButtonList.push(
          <Button label={apiId} key={apiId} data-id={apiId} icon="pi pi-folder-open" className="p-button-text p-button-plain p-button-outlined" onClick={onShowApi}/>        
        );
      }
      return (
        <Toolbar className="p-mb-4 product-api-toolbar" style={{ width: '10rem' }} left={jsxButtonList} />
      );
    }

    const renderAttributesInfo = (attributeList?: Array<TApiAttribute>): JSX.Element => {
      let attributesJSXElementList: Array<JSX.Element> = [];
      
      const addAttributeJSXElement = (attribute: TApiAttribute) => {
        const jsxElem: JSX.Element = (
          <li>
            {attribute.name}: [{attribute.value}]
          </li>
        );
        attributesJSXElementList.push(jsxElem);
      }

      if(attributeList) {
        attributeList.forEach( (attribute: TApiAttribute) => {
          addAttributeJSXElement(attribute);  
        });
        return (
          <div>
            Controlled Attributes: 
            <ul style={{ "listStyle": "disc", "padding": "0px 0px 0px 30px" }}>
              {attributesJSXElementList}
            </ul>
          </div>
        );
      }
      else return (
        <div>
          Controlled Attributes: none.
        </div>
      );
    }
  
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="api-product-view">
            {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
            <div className="api-product-view-detail">
              {/* <div className="api-product-name">{props.apiProductDisplayName}</div> */}
              <div className="api-product-description">{managedObjectDisplay.apiObject.description}</div>
              <div>Approval: {managedObjectDisplay.apiObject.approvalType}</div>
              <div>Gateways: {managedObjectDisplay.environmentListAsString}</div>
              <div>Protocols: {managedObjectDisplay.protocolListAsString}</div>
              {renderAttributesInfo(managedObject.apiObject.attributes)}
              {/* <i className="pi pi-tag product-category-icon"></i><span className="product-category">{data.category}</span> */}
              <div className="api-product-apis">Async API Spec(s):</div>
              {renderShowApiButtons()}
            </div>
            <div className="api-product-action">
              <Rating value={4} readOnly cancel={false}></Rating>
                {/* <span className="api-product-apis">Async API Spec(s)</span> */}
                {/* <span>{JSON.stringify(managedObjectDisplay.apiObject.apis)}</span> */}

                {/* <Button icon="pi pi-shopping-cart" label="Add to Cart" disabled={data.inventoryStatus === 'OUTOFSTOCK'}></Button>
                <span className={`product-badge status-${data.inventoryStatus.toLowerCase()}`}>{data.inventoryStatus}</span> */}
            </div>            
          </div>
        </div>  
        <hr/>        
        {apiSpec && showApiId &&
          <APDisplayAsyncApiSpec 
            schema={apiSpec} 
            schemaId={showApiId} 
            onDownloadSuccess={props.onSuccess}
            onDownloadError={props.onError}
          />
        }
      </React.Fragment>
    ); 
  }

  return (
    <div className="adp-productcatalog">

      <APComponentHeader header={`API Product: ${props.apiProductDisplayName}`} />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
