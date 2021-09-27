
import React from "react";

import { APIInfo } from "@solace-iot-team/platform-api-openapi-client-fe";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApisCommon";
import { APConnectorApiCalls, TGetAsyncApiSpecResult } from "../../../utils/APConnectorApiCalls";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";

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
    apiInfo: APIInfo
  }
  type TManagedObjectDisplay = TManagedObject & {
    anotherField: string
  }

  const transformGetManagedObjectToManagedObject = (id: TManagedObjectId, displayName: string, apiInfo: APIInfo, asyncApiSpec: TAPAsyncApiSpec): TManagedObject => {
    return {
      id: id,
      displayName: displayName,
      asyncApiSpec: asyncApiSpec,
      apiInfo: apiInfo
    }
  }

  const transformManagedObjectToDisplay = (managedObject: TManagedObject): TManagedObjectDisplay => {
    return {
      ...managedObject,
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
    if(result.apiCallState.success && result.apiInfo && result.asyncApiSpec) {
      setManagedObject(transformGetManagedObjectToManagedObject(props.apiId, props.apiDisplayName, result.apiInfo, result.asyncApiSpec));
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

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const managedObjectDisplay: TManagedObjectDisplay = transformManagedObjectToDisplay(managedObject);

    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="api-view">
            {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
            <div className="api-view-detail-left">
              {/* <div>Source: {managedObjectDisplay.apiInfo?.source}</div> */}
            </div>
            <div className="api-view-detail-right">
              <div>Id: {managedObjectDisplay.id}</div>
              <div>Source: {managedObjectDisplay.apiInfo?.source}</div>
              {/* <div>
                <div>Info:</div>
                <pre style={ { fontSize: '10px' }} >
                  {JSON.stringify(managedObjectDisplay.apiInfo, null, 2)}
                </pre>
              </div>   */}
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
