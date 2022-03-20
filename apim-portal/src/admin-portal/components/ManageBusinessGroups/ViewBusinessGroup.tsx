
import React from "react";

import { Divider } from "primereact/divider";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageBusinessGroupsCommon";
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplay } from "../../../displayServices/APBusinessGroupsDisplayService";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../utils/APEntityIdsService";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";

import '../../../components/APComponents.css';
import "./ManageBusinessGroups.css";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";

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
      const object: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.getApBusinessGroupDisplay({
        organizationId: props.organizationId,
        businessGroupId: props.businessGroupEntityId.id
      });
      setManagedObject(object);
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
      <div><b>Source</b>: {APBusinessGroupsDisplayService.getSourceDisplayString(mo)}</div>
    );
  }
  const renderChildren = (apChildrenEntityIdList: TAPEntityIdList): JSX.Element => {
    if(apChildrenEntityIdList.length > 0) {
      return(
        <div><b>Children</b>: {APEntityIdsService.getSortedDisplayNameList_As_String(apChildrenEntityIdList)}</div>
      );
    }
    return (
      <div><b>Children</b>: None.</div>    
    );
  }
  const renderMembers = (apUserEntityIdList: TAPEntityIdList): JSX.Element => {
    return (
      <React.Fragment>
        <div><b>Members:</b></div>
        <div className="p-ml-2">
          {APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_DisplayNameList(apUserEntityIdList))}
        </div>
      </React.Fragment>
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
              {renderChildren(managedObject.apBusinessGroupChildrenEntityIdList)}

              <Divider />
              {renderMembers(managedObject.apMemberUserEntityIdList)}

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
