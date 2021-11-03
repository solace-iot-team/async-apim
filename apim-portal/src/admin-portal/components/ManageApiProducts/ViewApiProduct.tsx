
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Divider } from "primereact/divider";

import { 
  APIProduct, 
  ApiProductsService, 
  ApisService 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApiProductsCommon";
import { TViewManagedApiProduct } from "../../../components/APApiObjectsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { APDisplayAttributes } from "../../../components/APDisplay/APDisplayAttributes";
import { APDisplayClientOptions } from "../../../components/APDisplay/APDisplayClientOptions";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IViewApiProductProps {
  organizationId: TAPOrganizationId,
  apiProductId: TManagedObjectId;
  apiProductDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewApiProduct: React.FC<IViewApiProductProps> = (props: IViewApiProductProps) => {
  const componentName = 'ViewApiProduct';

  type TGetManagedObject = TViewManagedApiProduct;
  type TManagedObjectDisplay = TGetManagedObject & {
    protocolListAsString: string;
  }

  const transformGetManagedObjectToManagedObjectDisplay = (getManagedObject: TGetManagedObject): TManagedObjectDisplay => {
    const managedObjectDisplay: TManagedObjectDisplay = {
      ...getManagedObject,
      protocolListAsString: APRenderUtils.getProtocolListAsString(getManagedObject.apiProduct.protocols),
    }
    return managedObjectDisplay;
  }

  const [managedObjectDisplay, setManagedObjectDisplay] = React.useState<TManagedObjectDisplay>();  
  const [showApiId, setShowApiId] = React.useState<string>();
  const [apiSpec, setApiSpec] = React.useState<any>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apiProductDisplayName}`);
    try { 
      const apiProduct: APIProduct = await ApiProductsService.getApiProduct({
        organizationName: props.organizationId,
        apiProductName: props.apiProductId
      });

      // get all the other lists ...

      const getManagedObject: TGetManagedObject = {
        apiProduct: apiProduct,
        apiEnvironmentList: [],
        apiInfoList: [],
        id: apiProduct.name,
        displayName: apiProduct.displayName
      }
      setManagedObjectDisplay(transformGetManagedObjectToManagedObjectDisplay(getManagedObject));
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
      const api: any = await ApisService.getApi({
        organizationName: props.organizationId, 
        apiName: apiId, 
        format: "application/json"
      });
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

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doFetchApi = async (apiId: string) => {
    props.onLoadingChange(true);
    await apiGetApi(apiId, apiId);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    if(showApiId) doFetchApi(showApiId);
  }, [showApiId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderShowApiButtons = () => {
    const funcName = 'renderShowApiButtons';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);

    const onShowApi = (event: any): void => {
      setShowApiId(event.currentTarget.dataset.id);
    }
  
    let jsxButtonList: Array<JSX.Element> = [];

    for (const apiId of managedObjectDisplay?.apiProduct.apis) {
      jsxButtonList.push(
        <Button 
          label={apiId} 
          key={apiId} 
          data-id={apiId} 
          // icon="pi pi-folder-open" 
          // className="p-button-text p-button-plain p-button-outlined p-button-rounded" 
          className="p-button-text p-button-plain" 
          style={{ whiteSpace: 'nowrap' }}          
          onClick={onShowApi}
        />        
      );
    }
    const renderButtons = () => {
      return (
        <div className="p-grid">
          {jsxButtonList}
        </div>
      );
    }
    return (
      <Toolbar         
        style={{ 
          background: 'none',
          border: 'none'
        }} 
        left={renderButtons()}
      />
    );
  }

  const renderManagedObjectDisplay = () => {
    const funcName = 'renderManagedObjectDisplay';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="api-product-view">
            <div className="api-product-view-detail-left">
              <div className="p-text-bold">Description:</div>
              <div className="p-ml-2">{managedObjectDisplay.apiProduct.description}</div>
              <div><b>Approval type</b>: {managedObjectDisplay.apiProduct.approvalType}</div>

              <div className="p-text-bold">APIs:</div>
              {renderShowApiButtons()}

              <div className="p-text-bold">Environments:</div>
              <div className="p-ml-2">{managedObjectDisplay.apiProduct.environments?.join(', ')}</div>
              <div className="p-text-bold">Protocols:</div>
              <div className="p-ml-2">{managedObjectDisplay.protocolListAsString}</div>
              <div className="p-text-bold">Attributes:</div>
              <APDisplayAttributes
                attributeList={managedObjectDisplay.apiProduct.attributes}
                emptyMessage="No attributes defined"
                className="p-ml-4"
              />
              <div className="p-text-bold">Client Options:</div>
              <APDisplayClientOptions
                clientOptions={managedObjectDisplay.apiProduct.clientOptions}
                className="p-ml-4"
              />
            </div>
            <div className="api-product-view-detail-right">
              <div>Id: {managedObjectDisplay.id}</div>
            </div>            
          </div>
        </div>  
        {apiSpec && showApiId &&
          <React.Fragment>
            <Divider/>        
            <APDisplayAsyncApiSpec 
              schema={apiSpec} 
              schemaId={showApiId} 
              onDownloadSuccess={props.onSuccess}
              onDownloadError={props.onError}
            />
          </React.Fragment>  
        }
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="manage-api-products">

        <APComponentHeader header={`API Product: ${props.apiProductDisplayName}`} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObjectDisplay && renderManagedObjectDisplay() }

      </div>
      {/* DEBUG */}
      {/* <pre style={ { fontSize: '10px' }} >
        {JSON.stringify(managedObjectDisplay, null, 2)}
      </pre> */}
    </React.Fragment>
  );
}
