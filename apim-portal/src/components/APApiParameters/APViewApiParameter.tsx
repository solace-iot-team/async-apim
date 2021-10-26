
import React from "react";

// import { DataTable } from 'primereact/datatable';
// import { Column } from "primereact/column";

import { APIParameter } from "@solace-iot-team/apim-connector-openapi-browser";

import { TAPApiParameter } from "./APApiParametersCommon";

import { TApiCallState } from "../../utils/ApiCallState";

import { APRenderUtils } from "../../utils/APRenderUtils";

// import { EnvironmentsService } from '@solace-iot-team/apim-connector-openapi-browser';

// import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
// import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
// import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
// import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
// import { TAPEnvironmentName, TAPOrganizationId } from "../../../components/APComponentsCommon";
// import { ManageEnvironmentsCommon, E_CALL_STATE_ACTIONS, TViewApiObject, TViewManagedObject } from "./ManageEnvironmentsCommon";

import "../APComponents.css";
import "./APManageApiParameter.css";

export interface IAPViewApiParameterProps {
  apiParameter: APIParameter,
  onError: (apiCallState: TApiCallState) => void
}

export const APViewApiParameter: React.FC<IAPViewApiParameterProps> = (props: IAPViewApiParameterProps) => {
  const componentName = 'APViewApiParameter';

  type TManagedObject = APIParameter;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const dt = React.useRef<any>(null);

  // * useEffect Hooks *
  const doInitialize = () => {
    setManagedObject(props.apiParameter);
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
    if(!managedObject) return (<></>);
    return (
      <div className="card">
        <p>Type: {managedObject.type}</p>
        {managedObject.enum &&
          <React.Fragment>
            <p>Values: {managedObject.enum.join(', ')}</p>
          </React.Fragment>
        }
        {!managedObject.enum &&
          <React.Fragment>
            <p>Pattern: *</p>
          </React.Fragment>
        }
      </div>
    )
  }

  return (
    <div>

      {/* <APComponentHeader header={`Environment: ${props.environmentDisplayName} (${props.environmentName})`} /> */}

      {/* <ApiCallStatusError apiCallStatus={apiCallStatus} /> */}

      {managedObject && renderManagedObject() }

    </div>
  );
}
