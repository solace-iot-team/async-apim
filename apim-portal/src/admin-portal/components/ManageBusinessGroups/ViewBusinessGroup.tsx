
import React from "react";

import { Divider } from "primereact/divider";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageBusinessGroupsCommon";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APBusinessGroupsService, { TAPBusinessGroupDisplay } from "../../../services/APBusinessGroupsService";
import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";

import '../../../components/APComponents.css';
import "./ManageBusinessGroups.css";

export interface IViewBusinessGroupProps {
  organizationId: string,
  businessGroupEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewBusinessGroup: React.FC<IViewBusinessGroupProps> = (props: IViewBusinessGroupProps) => {
  const componentName = 'ViewBusinessGroup';

  type TManagedObject = TAPBusinessGroupDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP, `retrieve details for business group: ${props.businessGroupEntityId.displayName}`);
    try { 
      const object: TAPBusinessGroupDisplay = await APBusinessGroupsService.getApBusinessGroupDisplay({
        organizationId: props.organizationId,
        businessGroupId: props.businessGroupEntityId.id
      });
      setManagedObject(object);
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

  const renderParentDisplayName = (mo: TManagedObject): JSX.Element => {
    if(mo.apBusinessGroupParentEntityId !== undefined) return (
      <div><b>Parent</b>: {mo.apBusinessGroupParentEntityId.displayName}</div>
    );
    return (<></>);
  }
  const renderParentId = (mo: TManagedObject): JSX.Element => {
    if(mo.apBusinessGroupParentEntityId !== undefined) return (
      <div>Parent Id: {mo.apBusinessGroupParentEntityId.id}</div>
    );
    return (<></>);
  }
  const renderSourceDisplayName = (mo: TManagedObject): JSX.Element => {
    return (
      <div><b>Source</b>: {APBusinessGroupsService.getSourceDisplayString(mo)}</div>
    );
  }
  const renderReferences = (mo: TManagedObject): JSX.Element => {
    if(mo.apsBusinessGroupResponse.businessGroupChildIds.length > 0) {
      return(
        <div><b>Children</b>: {APEntityIdsService.getSortedDisplayNameList_As_String(mo.apBusinessGroupChildrenEntityIdList)}</div>
      );
    }
    return (
      <div><b>Children</b>: None.</div>    
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="view">
            <div className="view-detail-left">
              
              {renderParentDisplayName(managedObject)}
              {renderSourceDisplayName(managedObject)}
              <div className="p-text-bold">Description:</div>
              <div className="p-ml-2">{managedObject.apsBusinessGroupResponse.description}</div>

              <Divider />

              {renderReferences(managedObject)}

            </div>
            <div className="view-detail-right">
              <div>Id: {managedObject.apEntityId.id}</div>
              {renderParentId(managedObject)}
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="ap-manage-business-groups">

        <APComponentHeader header={`Business Group: ${props.businessGroupEntityId.displayName}`} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObject && renderManagedObject() }

      </div>
      {/* DEBUG */}
      {/* <pre style={ { fontSize: '10px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre> */}
      {/* <pre style={ { fontSize: '10px' }} >
        apSearchContent={JSON.stringify(managedObject?.apSearchContent.split(','), null, 2)}
      </pre> */}
    </React.Fragment>
  );
}
