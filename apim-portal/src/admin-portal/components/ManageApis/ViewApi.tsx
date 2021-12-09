
import React from "react";

import { APIInfo, ApisService, CommonEntityNameList } from "@solace-iot-team/apim-connector-openapi-browser";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPAsyncApiSpec, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApisCommon";
import { APConnectorApiCalls, TGetAsyncApiSpecResult } from "../../../utils/APConnectorApiCalls";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { APRenderUtils } from "../../../utils/APRenderUtils";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IViewApiProps {
  organizationId: TAPOrganizationId,
  apiId: TManagedObjectId;
  apiDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewApi: React.FC<IViewApiProps> = (props: IViewApiProps) => {
  const componentName = 'ViewApi';

  type TManagedObject = {
    id: TManagedObjectId,
    displayName: string,
    asyncApiSpec: TAPAsyncApiSpec;
    apiInfo: APIInfo,
    apiUsedBy_ApiProductEntityNameList: CommonEntityNameList
  }
  type TManagedObjectDisplay = TManagedObject & {
    anotherField: string
  }

  const transformGetManagedObjectToManagedObject = (id: TManagedObjectId, displayName: string, apiInfo: APIInfo, asyncApiSpec: TAPAsyncApiSpec, apiApiProductEntityNameList: CommonEntityNameList): TManagedObject => {
    return {
      id: id,
      displayName: displayName,
      asyncApiSpec: asyncApiSpec,
      apiInfo: apiInfo,
      apiUsedBy_ApiProductEntityNameList: apiApiProductEntityNameList
    }
  }

  const transformManagedObjectToDisplay = (mo: TManagedObject): TManagedObjectDisplay => {
    return {
      ...mo,
      anotherField: 'placeholder'
    }
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    const initialApiCallState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve details for api: ${props.apiDisplayName}`);
    const result: TGetAsyncApiSpecResult = await APConnectorApiCalls.getAsyncApiSpec(props.organizationId, props.apiId, initialApiCallState);
    const apiApiProductEntityNameList: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
      organizationName: props.organizationId,
      apiName: props.apiId
    });
    if(result.apiCallState.success && result.apiInfo && result.asyncApiSpec) {
      setManagedObject(transformGetManagedObjectToManagedObject(props.apiId, props.apiDisplayName, result.apiInfo, result.asyncApiSpec, apiApiProductEntityNameList));
    }
    setApiCallStatus(result.apiCallState);
    return result.apiCallState;
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

  const renderUsedByApiProducts = (usedBy_ApiProductEntityNameList: CommonEntityNameList): JSX.Element => {
    if(usedBy_ApiProductEntityNameList.length === 0) return (<div>None.</div>);
    return (
      <div>
        {APRenderUtils.getCommonEntityNameListAsStringList(usedBy_ApiProductEntityNameList).join(', ')}
      </div>
    );
  }
  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const managedObjectDisplay: TManagedObjectDisplay = transformManagedObjectToDisplay(managedObject);

    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="api-view">
            <div className="api-view-detail-left">
              <div className="p-text-bold">Used by API Products:</div>
              <div className="p-ml-2">{renderUsedByApiProducts(managedObjectDisplay.apiUsedBy_ApiProductEntityNameList)}</div>
            </div>
            <div className="api-view-detail-right">
              <div>Id: {managedObjectDisplay.id}</div>
              <div>Source: {managedObjectDisplay.apiInfo?.source}</div>
            </div>            
          </div>
        </div>  
        <hr/>        
        <APDisplayAsyncApiSpec 
          schema={managedObjectDisplay.asyncApiSpec.spec} 
          schemaId={managedObjectDisplay.id}
          onDownloadError={props.onError}
          onDownloadSuccess={props.onSuccess}
        />
        {/* DEBUG */}
        {/* <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(managedObjectDisplay.asyncApiSpec, null, 2)}
        </pre> */}
      </React.Fragment>
    ); 
  }

  return (
    <div className="manage-apis">

      <APComponentHeader header={`API: ${props.apiDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
