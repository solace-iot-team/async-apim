
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import type { TAPOrganizationIdList } from "../APComponentsCommon";
import type { TApiCallState } from '../../utils/ApiCallState';
import { ApiCallState } from '../../utils/ApiCallState';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { ConfigContext } from '../../components/ConfigContextProvider/ConfigContextProvider';
import { UserContext } from '../UserContextProvider/UserContextProvider';
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";
import { APOrganizationsService, TAPOrganizationList } from "../../utils/APOrganizationsService";
import { AuthHelper } from "../../auth/AuthHelper";
import { AuthContext } from "../AuthContextProvider/AuthContextProvider";

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

  const transformAPOrganizationListToSelectObjectList = (apOrganizationList: TAPOrganizationList): TSelectObjectList => {
    const funcName = 'transformAPOrganizationListToSelectObjectList';
    const logName = `${componentName}.${funcName}()`;

    // TODO: this is possible, handle it nicely
    if(userContext.user.memberOfOrganizations === undefined) throw new Error(`${logName}: userContext.user.memberOfOrganizations`);

    const selectObjectList: TSelectObjectList = [];
    for(const apOrganization of apOrganizationList) {
      const memberOf = userContext.user.memberOfOrganizations.find( (x) => {
        return x.organizationId === apOrganization.name;
      });
      if(memberOf !== undefined) {
        selectObjectList.push( {
          name: apOrganization.name,
          displayName: apOrganization.displayName
        });
      }
    }
    return selectObjectList;
  }


  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [selectObjectList, setSelectObjectList] = React.useState<TSelectObjectList>();
  const [selectObjectForSelectList, setSelectObjectForSelectList] = React.useState<TSelectObjectForSelectList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetSelectObjectListInProgress, setIsGetSelectObjectListInProgress] = React.useState<boolean>(false);
  const [selectedObject, setSelectedObject] = React.useState<TSelectObject>();

  // * Api Calls *
  const apiGetSelectObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetSelectObjectList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(CALL_STATE_ACTIONS.API_GET_SELECT_OBJECT_LIST, 'retrieve list of organizations');
    setIsGetSelectObjectListInProgress(true);
    try { 
      const apOrganizationList: TAPOrganizationList = await APOrganizationsService.listOrganizations({});
      setSelectObjectList(transformAPOrganizationListToSelectObjectList(apOrganizationList));
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
    props.onSuccess();
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    // const funcName = 'useEffect([]';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ..`)
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(userContext.runtimeSettings.currentOrganizationName) {
      dispatchAuthContextAction({ type: 'SET_AUTH_CONTEXT', authContext: { 
        isLoggedIn: true, 
        authorizedResourcePathsAsString: AuthHelper.getAuthorizedResourcePathListAsString(configContext, userContext),
      }});
    }
  }, [userContext.runtimeSettings.currentOrganizationName]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) {
        // alert('apiCallStatus not success')
        props.onError(apiCallStatus);
      }
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
    if(selectObjectList.length > 1) {
      setSelectObjectForSelectList(transformSelectObjectListToSelectObjectForSelectList(selectObjectList));
    }
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
    // alert(`rendering selectObjectForSelectList=${JSON.stringify(selectObjectForSelectList, null, 2)}`);
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
