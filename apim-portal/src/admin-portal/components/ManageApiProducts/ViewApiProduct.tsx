
import React from "react";

import { APIInfo, APIProduct, ApiProductsService } from "@solace-iot-team/apim-connector-openapi-browser";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPAsyncApiSpec, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { APConnectorApiCalls, TGetAsyncApiSpecResult } from "../../../utils/APConnectorApiCalls";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApiProductsCommon";
import { TViewManagedApiProduct } from "../../../components/APApiObjectsCommon";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";

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
    anotherField: string
  }

  const transformGetManagedObjectToManagedObjectDisplay = (getManagedObject: TGetManagedObject): TManagedObjectDisplay => {
    const managedObjectDisplay: TManagedObjectDisplay = {
      ...getManagedObject,
      anotherField: 'test'
    }
    return managedObjectDisplay;
  }

  const [managedObjectDisplay, setManagedObjectDisplay] = React.useState<TManagedObjectDisplay>();  
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

  const renderManagedObjectDisplay = () => {
    const funcName = 'renderManagedObjectDisplay';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="api-product-view">
            <div className="api-product-view-detail-left">
              <div className="api-product-description">Description: {managedObjectDisplay.apiProduct.description}</div>
            </div>
            <div className="api-product-view-detail-right">
              <div>Id: {managedObjectDisplay.id}</div>
            </div>            
          </div>
        </div>  
        <hr/>        
        {/* <APDisplayAsyncApiSpec 
          schema={managedObjectDisplay.asyncApiSpec.spec} 
          schemaId={managedObjectDisplay.id}
          onDownloadError={props.onError}
          onDownloadSuccess={props.onSuccess}
        /> */}
        {/* DEBUG */}
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(managedObjectDisplay, null, 2)}
        </pre>
      </React.Fragment>
    ); 
  }

  return (
    <div className="manage-api-products">

      <APComponentHeader header={`API Product: ${props.apiProductDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectDisplay && renderManagedObjectDisplay() }

    </div>
  );
}
