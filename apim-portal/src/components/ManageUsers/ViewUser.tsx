
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import { ConfigContext } from '../../components/ConfigContextProvider/ConfigContextProvider';
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageUsersCommon, TManagedObjectId, TViewManagedObject } from "./ManageUsersCommon";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { 
  ApsUsersService, 
  APSUser
} from '@solace-iot-team/apim-server-openapi-browser';

import "../APComponents.css";
import "./ManageUsers.css";

export interface IViewUserProps {
  userId: TManagedObjectId;
  userDisplayName: string;
  reInitializeTrigger: number,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewUser: React.FC<IViewUserProps> = (props: IViewUserProps) => {
  const componentName = 'ViewUser';

  type TManagedObject = TViewManagedObject;

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
      const apsUser: APSUser = await ApsUsersService.getApsUser(props.userId);
      setManagedObject(ManageUsersCommon.transformViewApiObjectToViewManagedObject(configContext, apsUser));
    } catch(e) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    let apiCallState: TApiCallState = await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []);

  React.useEffect(() => {
    doInitialize();
  }, [props.reInitializeTrigger]);

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]);

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

      {ManageUsersCommon.renderSubComponentHeader(`UserId: ${props.userId}`)}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
