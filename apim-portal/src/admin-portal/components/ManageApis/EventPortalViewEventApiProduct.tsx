
import React from "react";

import { APIInfo, EventPortalService } from "@solace-iot-team/apim-connector-openapi-browser";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApisCommon";
import { APConnectorApiCalls, TGetAsyncApiSpecResult } from "../../../utils/APConnectorApiCalls";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";

import '../../../components/APComponents.css';
import "./ManageApis.css";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";

export interface IEventPortalViewEventApiProductProps {
  organizationId: TAPOrganizationId,
  eventApiProductId: string;
  eventApiProductDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EventPortalViewEventApiProduct: React.FC<IEventPortalViewEventApiProductProps> = (props: IEventPortalViewEventApiProductProps) => {
  const componentName = 'EventPortalViewEventApiProduct';

  type TManagedObject = {
    id: TManagedObjectId,
    displayName: string,
    asyncApiSpec: TAPAsyncApiSpec;
    // apiInfo: APIInfo
  }
  type TManagedObjectDisplay = TManagedObject & {
    anotherField: string
  }

  const transformGetManagedObjectToManagedObject = (id: TManagedObjectId, displayName: string, asyncApiSpec: TAPAsyncApiSpec): TManagedObject => {
    return {
      id: id,
      displayName: displayName,
      asyncApiSpec: asyncApiSpec,
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EVENT_API_PRODUCT, `retrieve details for event api product: ${props.eventApiProductDisplayName}`);
    try {
      const apiAny: any = await EventPortalService.getEventApiProductAsyncApi({
        organizationName: props.organizationId,
        eventApiProductId: props.eventApiProductId,
        format: 'application/json'
      });  
      // throw new Error(`${logName}: test error handling`);
      let api: object;
      if(typeof(apiAny) === 'string') {
        api = JSON.parse(apiAny);
      } else {
        api = apiAny
      }
      const asyncApiSpec: TAPAsyncApiSpec = {
        spec: api,
        format: EAPAsyncApiSpecFormat.JSON
      }
      setManagedObject(transformGetManagedObjectToManagedObject(props.eventApiProductId, props.eventApiProductDisplayName, asyncApiSpec));
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

  const onSpecDownloadSuccess = (_callState: TApiCallState): void => {}

  const onSpecDownloadError = (callState: TApiCallState): void => {
    const funcName = 'onSpecDownloadError';
    const logName = `${componentName}.${funcName}()`;

    alert(`${logName}: download error`);
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
            {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
            <div className="api-view-detail-left">
              <div>Name: {managedObjectDisplay.displayName}</div>
            </div>
            <div className="api-view-detail-right">
              <div>Id: {managedObjectDisplay.id}</div>
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
          schemaId={`EventApiProduct_${managedObjectDisplay.id}`}
          onDownloadError={onSpecDownloadError}
          onDownloadSuccess={onSpecDownloadSuccess}
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

      <APComponentHeader header={`Event API Product: ${props.eventApiProductDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
