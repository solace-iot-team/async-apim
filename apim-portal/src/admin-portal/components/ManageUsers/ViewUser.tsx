
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import { 
  ApsUsersService, 
  APSUser
} from '@solace-iot-team/apim-server-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ConfigContext } from '../../../components/ConfigContextProvider/ConfigContextProvider';
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageUsersCommon, TManagedObjectId, TViewManagedObject } from "./ManageUsersCommon";

import '../../../components/APComponents.css';
import "./ManageUsers.css";

export interface IViewUserProps {
  userId: TManagedObjectId;
  userDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewUser: React.FC<IViewUserProps> = (props: IViewUserProps) => {
  const componentName = 'ViewUser';

  type TManagedObject = TViewManagedObject;

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext); 
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${props.userId}`);
    try { 
      const apsUser: APSUser = await ApsUsersService.getApsUser({
        userId: props.userId
      });
      setManagedObject(ManageUsersCommon.transformViewApiObjectToViewManagedObject(configContext, apsUser));
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
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
    const dataTableList = [managedObject];

    return (
      <div className="card">
        <DataTable
          ref={dt}
          autoLayout={true}
          // header={'UserId: ' + managedObject.apiObject.userId}
          value={dataTableList}
          dataKey="id"
          >
            <Column field="isActive" header="Activated?" headerStyle={{width: '9em', textAlign: 'center'}} bodyStyle={{textAlign: 'center' }} body={ManageUsersCommon.isActiveBodyTemplate} sortable filterField="globalSearch" />
            <Column field="apiObject.profile.email" header="E-Mail" sortable />
            <Column field="roleDisplayNameListAsString" header="Roles" />
            <Column field="memberOfOrganizationNameListAsString" header="Organizations" />
            <Column field="apiObject.profile.first" header="First Name" sortable />
            <Column field="apiObject.profile.last" header="Last Name" sortable />
        </DataTable>
      </div>
    )
  }

  return (
    <div className="manage-users">

      <APComponentHeader header={`UserId: ${props.userId}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
