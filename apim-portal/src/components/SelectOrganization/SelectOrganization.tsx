
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

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
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { APEntityId, TAPEntityId, TAPEntityIdList } from "../../utils/APEntityId";

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

  const transformAPOrganizationListToAPEntityIdList = (apOrganizationList: TAPOrganizationList): TAPEntityIdList => {
    const funcName = 'transformAPOrganizationListToAPEntityIdList';
    const logName = `${componentName}.${funcName}()`;

    // TODO: this is possible, handle it nicely
    if(userContext.user.memberOfOrganizations === undefined) throw new Error(`${logName}: userContext.user.memberOfOrganizations`);

    const entityIdList: TAPEntityIdList = [];
    for(const apOrganization of apOrganizationList) {
      const memberOf = userContext.user.memberOfOrganizations.find( (x) => {
        return x.organizationId === apOrganization.name;
      });
      if(memberOf !== undefined) {
        entityIdList.push( {
          id: apOrganization.name,
          displayName: apOrganization.displayName
        });
      }
    }
    return APEntityId.sortAPEntityIdList_byDisplayName(entityIdList);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  const [selectObjectList, setSelectObjectList] = React.useState<TAPEntityIdList>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetSelectObjectListInProgress, setIsGetSelectObjectListInProgress] = React.useState<boolean>(false);
  const [selectedObject, setSelectedObject] = React.useState<TAPEntityId>();
  const [isFinished, setIsFinished] = React.useState<boolean>(false);

  // * Api Calls *
  const apiGetSelectObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetSelectObjectList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(CALL_STATE_ACTIONS.API_GET_SELECT_OBJECT_LIST, 'retrieve list of organizations');
    setIsGetSelectObjectListInProgress(true);
    try { 
      const apOrganizationList: TAPOrganizationList = await APOrganizationsService.listOrganizations({});
      setSelectObjectList(transformAPOrganizationListToAPEntityIdList(apOrganizationList));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setIsGetSelectObjectListInProgress(false);
    return callState;
  }

  const doInitialize = async () => {
    // Notes:
    // - connector may not be configured yet
    // - connector may be unavailable
    // - user may not be member of any org
    // ==> still able to login with roles = systemAdmin

    // if(!configContext.connector) {
    //   const callState: TApiCallState = ApiCallState.getInitialCallState(CALL_STATE_ACTIONS.NO_CONNECTOR_CONFIG, 'no connector config found');
    //   props.onError(callState);
    //   return;
    // }
    // if(healthCheckContext.connectorHealthCheckResult && healthCheckContext.connectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) {
    //   const callState: TApiCallState = ApiCallState.getInitialCallState(CALL_STATE_ACTIONS.CONNECTOR_UNAVAILABLE, 'connector unavailable');
    //   props.onError(callState);
    //   return;
    // }
    if(!userContext.user.memberOfOrganizations || userContext.user.memberOfOrganizations.length === 0) {
      setIsFinished(true);
      return;
    }
    const apiCallState: TApiCallState = await apiGetSelectObjectList();
    setApiCallStatus(apiCallState);
  }

  const doProcessSelectedObject = async(selectedObject: TAPEntityId) => {
    if(selectObjectList) dispatchUserContextAction({ type: 'SET_AVAILABLE_ORGANIZATION_ENTITY_ID_LIST', availableOrganizationEntityIdList: selectObjectList});
    dispatchUserContextAction({ type: 'SET_CURRENT_ORGANIZATION_ENTITY_ID', currentOrganizationEntityId: selectedObject });
    dispatchOrganizationContextAction({ type: 'SET_ORGANIZATION_CONTEXT', organizationContext: await APOrganizationsService.getOrganization(selectedObject.id)});
    setIsFinished(true);
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    // const funcName = 'useEffect([]';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ..`)
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isFinished || userContext.runtimeSettings.currentOrganizationEntityId) {
      dispatchAuthContextAction({ type: 'SET_AUTH_CONTEXT', authContext: { 
        isLoggedIn: true, 
        authorizedResourcePathsAsString: AuthHelper.getAuthorizedResourcePathListAsString(configContext, userContext),
      }});
    }
    if(isFinished) props.onSuccess();
  }, [isFinished, userContext.runtimeSettings.currentOrganizationEntityId]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
      setIsFinished(true);
      return;
    }
    if (selectObjectList.length === 1) {
      setSelectedObject(selectObjectList[0]);
      return;
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
            value={selectObjectList}
            selectionMode="single"
            onRowClick={onSelectObjectSelect}
            id="id"
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
      {!isGetSelectObjectListInProgress && selectObjectList && selectObjectList.length > 1 &&
        <div className="select-organization">
          <div>
            {renderSelectObjectList()}
          </div>      
        </div>
      }      
    </React.Fragment>      
  );
}
