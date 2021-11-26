
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';

import { 
  ApiProductsService, 
  APIProduct, 
  EnvironmentResponse,
  EnvironmentsService,
  CommonName,
  CommonDisplayName
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalProductCatalogCommon";
import { APManagedApiProductDisplay, TAPDeveloperPortalApiProductDisplay } from "../../../components/APComponentsCommon";
import { APDisplayAttributes } from "../../../components/APDisplay/APDisplayAttributes";
import { APDisplayClientOptions } from "../../../components/APDisplay/APDisplayClientOptions";
import { APDisplayApiProductAsyncApis } from "../../../components/APDisplay/APDisplayApiProductAsyncApis";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";

export interface IDeveloperPortalViewapiProductProps {
  organizationId: CommonName;
  apiProductId: CommonName;
  apiProductDisplayName: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalViewApiProduct: React.FC<IDeveloperPortalViewapiProductProps> = (props: IDeveloperPortalViewapiProductProps) => {
  const componentName = 'DeveloperPortalViewApiProduct';

  type TManagedObject = TAPDeveloperPortalApiProductDisplay;
  type TManagedObjectDisplay = TManagedObject;

  const transformManagedObjectToDisplay = (mo: TManagedObject): TManagedObjectDisplay => {
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObjectDisplay>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT, `retrieve details for product: ${props.apiProductDisplayName}`);
    try { 
      const apiApiProduct: APIProduct = await ApiProductsService.getApiProduct({
        organizationName: props.organizationId, 
        apiProductName: props.apiProductId
      });
      if(!apiApiProduct.environments) throw new Error(`${logName}: apiApiProduct.environments is undefined`);
      let apiEnvList: Array<EnvironmentResponse> = [];
      for(const envName of apiApiProduct.environments) {
        const _apiEnvResp: EnvironmentResponse = await EnvironmentsService.getEnvironment({
          organizationName: props.organizationId, 
          envName: envName
        });
        apiEnvList.push(_apiEnvResp);
      }
      setManagedObject(transformManagedObjectToDisplay(APManagedApiProductDisplay.createAPDeveloperPortalApiProductDisplayFromApiEntities(apiApiProduct, apiEnvList)));
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

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="api-product-view">
            <div className="api-product-view-detail-left">
              <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
                <TabPanel header='General'>
                  <div className="p-text-bold">Description:</div>
                  <div className="p-ml-2">{managedObject.apiApiProduct.description}</div>
                  <div><b>Approval type</b>: {managedObject.apiApiProduct.approvalType}</div>
                  <div className="p-text-bold">Environments:</div>
                  <div className="p-ml-2">{APManagedApiProductDisplay.getApEnvironmentsAsDisplayList(managedObject.apiEnvironmentList).sort().join(', ')}</div>
                  <div className="p-text-bold">Protocols:</div>
                  <div className="p-ml-2">{APManagedApiProductDisplay.getApProtocolListAsString(managedObject.apiApiProduct.protocols)}</div>
                  <div className="p-text-bold">Client Options:</div>
                  <APDisplayClientOptions
                    clientOptions={managedObject.apiApiProduct.clientOptions}
                    className="p-ml-4"
                  />
                </TabPanel>  
                <TabPanel header='Async API Specs'>
                  <APDisplayApiProductAsyncApis 
                    organizationId={props.organizationId}
                    apiProductId={props.apiProductId}
                    apiProductDisplayName={props.apiProductDisplayName}
                    label="Click to view API"
                    onError={props.onError}
                    onLoadingChange={props.onLoadingChange}
                  />
                </TabPanel>
                <TabPanel header='Controlled Attributes'>
                  <APDisplayAttributes
                    attributeList={managedObject.apiApiProduct.attributes}
                    emptyMessage="No attributes defined"
                    // className="p-ml-2"
                  />
                </TabPanel>
              </TabView>

            </div>
            <div className="api-product-view-detail-right">
              {/* <div>Id: {managedObject.apApiProductName}</div> */}
            </div>            
          </div>
        </div>  
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
