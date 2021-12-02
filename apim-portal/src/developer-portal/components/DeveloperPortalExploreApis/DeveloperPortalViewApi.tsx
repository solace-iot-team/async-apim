
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';

import { 
  ApiProductsService, 
  APIProduct, 
  EnvironmentResponse,
  EnvironmentsService,
  CommonName,
  CommonDisplayName,
  APIInfo,
  ApisService,
  CommonEntityNameList
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APManagedApiDisplay, APManagedApiProductDisplay, TAPDeveloperPortalApiDisplay } from "../../../components/APComponentsCommon";
import { APDisplayAttributes } from "../../../components/APDisplay/APDisplayAttributes";
import { APDisplayClientOptions } from "../../../components/APDisplay/APDisplayClientOptions";
import { APDisplayApiProductAsyncApis } from "../../../components/APDisplay/APDisplayApiProductAsyncApis";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalExploreApisCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalExploreApis.css";
import { APConnectorApiCalls, TGetAsyncApiSpecResult } from "../../../utils/APConnectorApiCalls";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { Divider } from "primereact/divider";

export interface IDeveloperPortalViewApiProps {
  organizationId: CommonName;
  apiId: CommonName;
  apiDisplayName: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalViewApi: React.FC<IDeveloperPortalViewApiProps> = (props: IDeveloperPortalViewApiProps) => {
  const componentName = 'DeveloperPortalViewApi';

  type TManagedObject = TAPDeveloperPortalApiDisplay;
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_DETAILS, `retrieve details for api: ${props.apiDisplayName}`);
    try { 
      const result: TGetAsyncApiSpecResult = await APConnectorApiCalls.getAsyncApiSpec(props.organizationId, props.apiId, callState);
      if(result.apiCallState.success && result.apiInfo && result.asyncApiSpec) {
        const apiApiProductEntityNameList: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
          organizationName: props.organizationId,
          apiName: result.apiInfo.name
        });
        if(apiApiProductEntityNameList.length === 0) throw new Error(`${logName}: apiApiProductEntityNameList.length === 0`);
        setManagedObject(transformManagedObjectToDisplay(APManagedApiDisplay.createAPDeveloperPortalApiDisplayFromApiEntities(result.apiInfo, apiApiProductEntityNameList, result.asyncApiSpec)));
      } else callState = result.apiCallState;
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

  const renderApiProducts = (usedBy_ApiProductEntityNameList: CommonEntityNameList): JSX.Element => {
    const funcName = 'renderApiProducts';
    const logName = `${componentName}.${funcName}()`;
    if(usedBy_ApiProductEntityNameList.length === 0) throw new Error(`${logName}: usedBy_ApiProductEntityNameList.length === 0`);
    return (
      <div>
        {APRenderUtils.getCommonEntityNameListAsStringList(usedBy_ApiProductEntityNameList).join(', ')}
      </div>
    );
  }

  const renderManagedObject = (mo: TManagedObject) => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!mo.apAsyncApiSpec) throw new Error(`${logName}: mo.apAsyncApiSpec is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="view">
            <div className="detail-left">

              <div className="p-text-bold">API Products:</div>
              <div className="p-ml-2">{renderApiProducts(mo.apiUsedBy_ApiProductEntityNameList)}</div>

              <Divider />
              <APDisplayAsyncApiSpec 
                schema={mo.apAsyncApiSpec.spec} 
                schemaId={mo.apName}
                onDownloadError={props.onError}
                onDownloadSuccess={props.onSuccess}
              />

            </div>
            <div className="detail-right">
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  return (
    <div className="adp-explore-apis">

      <APComponentHeader header={`API: ${props.apiDisplayName}`} />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject(managedObject) }

    </div>
  );
}
