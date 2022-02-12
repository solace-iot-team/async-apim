
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Divider } from "primereact/divider";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APDisplayApAttributeDisplayList } from "../../../components/APDisplay/APDisplayApAttributeDisplayList";
import { APDisplayClientOptions } from "../../../components/APDisplay/APDisplayClientOptions";
import APAdminPortalApiProductsService, { TAPAdminPortalApiProductDisplay } from "../../utils/APAdminPortalApiProductsService";
import { TAPApiSpecDisplay } from "../../../utils/APApiSpecsService";
import { TAPEntityIdList } from "../../../utils/APEntityIdsService";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IViewApiProductProps {
  organizationId: string,
  apiProductId: string;
  apiProductDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewApiProduct: React.FC<IViewApiProductProps> = (props: IViewApiProductProps) => {
  const componentName = 'ViewApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay;

  // type TGetManagedObject = TViewManagedApiProduct;
  // type TManagedObjectDisplay = TGetManagedObject & {
  //   protocolListAsString: string;
  // }

  // const transformGetManagedObjectToManagedObjectDisplay = (getManagedObject: TGetManagedObject): TManagedObjectDisplay => {
  //   const managedObjectDisplay: TManagedObjectDisplay = {
  //     ...getManagedObject,
  //     apiProduct: {
  //       ...getManagedObject.apiProduct,
  //       accessLevel: getManagedObject.apiProduct.accessLevel ? getManagedObject.apiProduct.accessLevel : C_DEFAULT_API_PRODUCT_ACCESS_LEVEL,
  //     },
  //     protocolListAsString: APRenderUtils.getProtocolListAsString(getManagedObject.apiProduct.protocols),
  //   }
  //   return managedObjectDisplay;
  // }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [showApiId, setShowApiId] = React.useState<string>();
  const [apiSpec, setApiSpec] = React.useState<TAPApiSpecDisplay>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apiProductDisplayName}`);
    try { 
      const object: TAPAdminPortalApiProductDisplay = await APAdminPortalApiProductsService.getAdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apiProductId
      });
      setManagedObject(object);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // const apiGetManagedObject = async(): Promise<TApiCallState> => {
  //   const funcName = 'apiGetManagedObject';
  //   const logName = `${componentName}.${funcName}()`;
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apiProductDisplayName}`);
  //   try { 
  //     const apiProduct: APIProduct = await ApiProductsService.getApiProduct({
  //       organizationName: props.organizationId,
  //       apiProductName: props.apiProductId
  //     });
  //     const apiAppEntityNameList: CommonEntityNameList = await ApiProductsService.listAppReferencesToApiProducts({
  //       organizationName: props.organizationId,
  //       apiProductName: props.apiProductId
  //     });
  //     const getManagedObject: TGetManagedObject = {
  //       apiProduct: apiProduct,
  //       apiEnvironmentList: [],
  //       apiInfoList: [],
  //       id: apiProduct.name,
  //       displayName: apiProduct.displayName,
  //       apiUsedBy_AppEntityNameList: apiAppEntityNameList
  //     }
  //     setManagedObjectDisplay(transformGetManagedObjectToManagedObjectDisplay(getManagedObject));
  //   } catch(e) {
  //     APClientConnectorOpenApi.logError(logName, e);
  //     callState = ApiCallState.addErrorToApiCallState(e, callState);
  //   }
  //   setApiCallStatus(callState);
  //   return callState;
  // }

  const apiGetApiSpec = async(apiId: string, apiDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetApiSpec';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve api spec: ${apiDisplayName}`);
    try { 
      const apiProductApiSpec: TAPApiSpecDisplay = await APAdminPortalApiProductsService.getApiSpec({
        organizationId: props.organizationId, 
        apiProductId: props.apiProductId,
        apiEntityId: { id: apiId, displayName: apiDisplayName }
      });
      setApiSpec(apiProductApiSpec);
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

  const doFetchApiSpec = async (apiId: string) => {
    props.onLoadingChange(true);
    await apiGetApiSpec(apiId, apiId);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    if(showApiId) doFetchApiSpec(showApiId);
  }, [showApiId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderShowApiButtons = () => {
    const funcName = 'renderShowApiButtons';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);

    const onShowApi = (event: any): void => {
      setShowApiId(event.currentTarget.dataset.id);
    }
  
    const jsxButtonList: Array<JSX.Element> = [];
    for (const apApiDisplay of managedObject.apApiDisplayList) {
      jsxButtonList.push(
        <Button 
          label={apApiDisplay.apEntityId.displayName} 
          key={apApiDisplay.apEntityId.id} 
          data-id={apApiDisplay.apEntityId.id} 
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

  const renderUsedByApps = (apAppReferenceEntityIdList: TAPEntityIdList): JSX.Element => {
    if(apAppReferenceEntityIdList.length === 0) return (<div>None.</div>);
    return (
      <div>
        {apAppReferenceEntityIdList.join(', ')}
      </div>
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="api-product-view">
            <div className="api-product-view-detail-left">
              
              <div className="p-text-bold">Description:</div>
              <div className="p-ml-2">{managedObject.connectorApiProduct.description}</div>

              <div><b>Approval type</b>: {managedObject.connectorApiProduct.approvalType}</div>
              <div><b>Access level</b>: {managedObject.connectorApiProduct.accessLevel}</div>

              <div className="p-text-bold">APIs:</div>
              {renderShowApiButtons()}

              <div className="p-text-bold">Environments:</div>
              {/* <div className="p-ml-2">{managedObjectDisplay.apiProduct.environments?.join(', ')}</div> */}
              <div className="p-ml-2">{managedObject.apEnvironmentDisplayNameList.join(', ')}</div>

              <div className="p-text-bold">Protocols:</div>
              <div className="p-ml-2">{managedObject.apProtocolDisplayNameList.join(', ')}</div>

              <div className="p-text-bold">Attributes:</div>
              <APDisplayApAttributeDisplayList
                apAttributeDisplayList={managedObject.apAttributeDisplayList}
                emptyMessage="No attributes defined"
                className="p-ml-4"
              />

              <div className="p-text-bold">Client Options:</div>
              <APDisplayClientOptions
                clientOptions={managedObject.connectorApiProduct.clientOptions}
                className="p-ml-4"
              />

              <Divider />
              <div className="p-text-bold">Used by Apps:</div>
              <div className="p-ml-2">{renderUsedByApps(managedObject.apAppReferenceEntityIdList)}</div>

            </div>
            <div className="api-product-view-detail-right">
              <div>Id: {managedObject.apEntityId.id}</div>
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

        {managedObject && renderManagedObject() }

      </div>
      {/* DEBUG */}
      {/* <pre style={ { fontSize: '10px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre> */}
    </React.Fragment>
  );
}
