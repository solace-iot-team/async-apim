
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import { APSOrganizationRoles } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import type { TAPOrganizationId, TAPOrganizationIdList } from "../APComponentsCommon";
import type { TApiCallState } from '../../utils/ApiCallState';
import { ApiCallState } from '../../utils/ApiCallState';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { ConfigContext } from '../../components/ConfigContextProvider/ConfigContextProvider';
import { UserContext } from '../UserContextProvider/UserContextProvider';
import { Organization, AdministrationService } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";

import "../APComponents.css";
import "./SelectOrganization.css";

export enum CALL_STATE_ACTIONS {
  INITIALIZE_MODULE = "INITIALIZE_MODULE",
  API_GET_SELECT_OBJECT_LIST = "API_GET_SELECT_OBJECT_LIST",
  NO_CONNECTOR_CONFIG = "NO_CONNECTOR_CONFIG",
  CONNECTOR_UNAVAILABLE = "CONNECTOR_UNAVAILABLE"
}

export interface ISelectOrganizationProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: () => void;
}

export const SelectOrganization: React.FC<ISelectOrganizationProps> = (props: ISelectOrganizationProps) => {
  const componentName = 'SelectOrganization';

  type TApiObject = Organization;
  type TApiObjectList = Array<TApiObject>;
  type TSelectObject = {
    displayName: string, 
    name: string
  }
  type TSelectObjectList = Array<TSelectObject>;
  type TSelectObjectForSelect = TSelectObject;
  type TSelectObjectForSelectList = Array<TSelectObjectForSelect>;

  const transformSelectObjectListToSelectObjectForSelectList = (selectObjectList: TSelectObjectList): TSelectObjectForSelectList => {
    const _selectObjectForSelectList: TSelectObjectForSelectList = selectObjectList;
    return _selectObjectForSelectList.sort( (e1: TSelectObjectForSelect, e2: TSelectObjectForSelect) => {
      if(e1.displayName < e2.displayName) return -1;
      if(e1.displayName > e2.displayName) return 1;
      return 0;
    });
  }

  const transformSelectObjectListToUserContextAvailableOrganizationNameList = (selectObjectList: TSelectObjectList): TAPOrganizationIdList => {
    let organizationNameList: TAPOrganizationIdList = [];
    selectObjectList.forEach( (selectObject: TSelectObject) => {
      organizationNameList.push(selectObject.name);
    });
    return organizationNameList;
  }

  const transformApiObjectListToSelectObjectList = (apiObjectList: TApiObjectList): TSelectObjectList => {
    const funcName = 'transformApiObjectListToSelectObjectList';
    const logName = `${componentName}.${funcName}()`;
    if(!userContext.user.memberOfOrganizations) throw new Error(`${logName}: user is not a member of any organization`);
    const userMemberOfOrganizationNameList: TAPOrganizationIdList = userContext.user.memberOfOrganizations.map( (apsOrganizationRoles: APSOrganizationRoles) => {
      return apsOrganizationRoles.organizationId;
    });
    let selectObjectList: TSelectObjectList = [];
    apiObjectList.forEach((apiObject: TApiObject) => {
      const organizationName: TAPOrganizationId | undefined = userMemberOfOrganizationNameList.find((userMemberOfOrganizationName: TAPOrganizationId) => {
        return (userMemberOfOrganizationName === apiObject.name)  
      });
      if(organizationName) selectObjectList.push({
        displayName: apiObject.name,
        name: apiObject.name
      });
    });
    return selectObjectList; 
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [selectObjectList, setSelectObjectList] = React.useState<TSelectObjectList>();
  const [selectObjectForSelectList, setSelectObjectForSelectList] = React.useState<TSelectObjectForSelectList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetSelectObjectListInProgress, setIsGetSelectObjectListInProgress] = React.useState<boolean>(false);
  const [selectedObject, setSelectedObject] = React.useState<TSelectObject>();

  // * Custom *

  // * Utils *
  // * Api Calls *
  const apiGetSelectObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetSelectObjectList';
    const logName = `${componentName}.${funcName}()`;

    let callState: TApiCallState = ApiCallState.getInitialCallState(CALL_STATE_ACTIONS.API_GET_SELECT_OBJECT_LIST, 'retrieve list of organizations');
    // setApiCallStatus(null);
    setIsGetSelectObjectListInProgress(true);
    try { 
      const apiSelectObjectList: TApiObjectList = await AdministrationService.listOrganizations({});
      // console.log(`${logName}: apiSelectObjectList=${JSON.stringify(apiSelectObjectList, null, 2)} `);
      setSelectObjectList(transformApiObjectListToSelectObjectList(apiSelectObjectList));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setIsGetSelectObjectListInProgress(false);
    return callState;
  }

  const doInitialize = async () => {
    if(!configContext.connector) {
      const callState: TApiCallState = ApiCallState.getInitialCallState(CALL_STATE_ACTIONS.NO_CONNECTOR_CONFIG, 'no connector config found');
      props.onError(callState);
      return;
    }
    if(healthCheckContext.connectorHealthCheckResult && healthCheckContext.connectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) {
      const callState: TApiCallState = ApiCallState.getInitialCallState(CALL_STATE_ACTIONS.CONNECTOR_UNAVAILABLE, 'connector unavailable');
      props.onError(callState);
      return;
    }
    if(!userContext.user.memberOfOrganizations || userContext.user.memberOfOrganizations.length === 0) {
      props.onSuccess();
      return;
    }
    const apiCallState: TApiCallState = await apiGetSelectObjectList();
    setApiCallStatus(apiCallState);
  }

  const doProcessSelectedObject = (selectedObject: TSelectObject) => {
    if(selectObjectList) dispatchUserContextAction({ type: 'SET_AVAILABLE_ORGANIZATION_NAME_LIST', availableOrganizationNameList: transformSelectObjectListToUserContextAvailableOrganizationNameList(selectObjectList)})
    dispatchUserContextAction({ type: 'SET_CURRENT_ORGANIZATION_NAME', currentOrganizationName: selectedObject.name });
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(userContext.runtimeSettings.currentOrganizationName) props.onSuccess();
  }, [userContext.runtimeSettings.currentOrganizationName]);

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(!selectObjectList) return;
    if(selectObjectList.length === 0) {
      dispatchUserContextAction({ type: 'SET_AVAILABLE_ORGANIZATION_NAME_LIST', availableOrganizationNameList: transformSelectObjectListToUserContextAvailableOrganizationNameList(selectObjectList)})
      props.onSuccess();
      return;
    }
    if (selectObjectList.length === 1) {
      setSelectedObject(selectObjectList[0]);
      return;
    }
    if(selectObjectList.length > 1) setSelectObjectForSelectList(transformSelectObjectListToSelectObjectForSelectList(selectObjectList));
  }, [selectObjectList]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(selectedObject) doProcessSelectedObject(selectedObject);
  }, [selectedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */
 

  // * Select UI *
  const dt = React.useRef<any>(null);

  const onSelectObjectSelect = (event: any): void => {
    setSelectedObject(event.data);
  }  

  const renderSelectObjectList = () => {
    return (
      <div className="card">
        <DataTable
            ref={dt}
            value={selectObjectForSelectList}
            selectionMode="single"
            onRowClick={onSelectObjectSelect}
            sortMode="single" 
            sortField="displayName" 
            sortOrder={1}
            scrollable 
            scrollHeight="800px" 
          >
            <Column field="displayName" header="Select Organization" />
        </DataTable>
      </div>
    );
  }


  return (
    <React.Fragment>
      {!isGetSelectObjectListInProgress && selectObjectForSelectList.length > 1 &&
        <div className="select-organization">
          <div>
            {renderSelectObjectList()}
          </div>      
        </div>
      }      
    </React.Fragment>      
  );
}
