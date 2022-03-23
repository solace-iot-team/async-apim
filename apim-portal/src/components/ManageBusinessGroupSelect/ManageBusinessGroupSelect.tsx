
import React from "react";

import { Divider } from "primereact/divider";

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { UserContext } from "../APContextProviders/APUserContextProvider";
import APLoginUsersDisplayService, { 
  TAPLoginUserDisplay, 
} from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { TAPEntityId } from "../../utils/APEntityIdsService";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayTreeNodeList,
  TAPSessionInfoDisplay
 } from "../../displayServices/APUsersDisplayService/APMemberOfService";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";
import { SelectBusinessGroup } from "./SelectBusinessGroup";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageBusinessGroupSelectCommon";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";

import '../APComponents.css';
import "./ManageBusinessGroupSelect.css";

export interface IManageBusinessGroupSelectProps {
  apLoginUserDisplay: TAPLoginUserDisplay;
  apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList; /** not pruned */
  currentBusinessGroupEntityId: TAPEntityId;
  onSuccess: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageBusinessGroupSelect: React.FC<IManageBusinessGroupSelectProps> = (props: IManageBusinessGroupSelectProps) => {
  const ComponentName = 'ManageBusinessGroupSelect';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [selectedBusinessGroupEntityId, setSelectedBusinessGroupEntityId] = React.useState<TAPEntityId>();
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  const apiUpdateSession = async({ organizationEntityId, userEntityId, businessGroupEntityId }: {
    organizationEntityId: TAPEntityId;
    userEntityId: TAPEntityId;
    businessGroupEntityId: TAPEntityId;
  }): Promise<TApiCallState> => {
    const funcName = 'apiUpdateSession';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_SESSION, `update session for user: ${userEntityId.id}`);
    try {
      const apSessionInfoDisplay: TAPSessionInfoDisplay = {
        businessGroupId: businessGroupEntityId.id
      }
      await APLoginUsersDisplayService.apsUpdate_ApOrganizationSessionInfoDisplay({
        userId: userEntityId.id,
        organizationId: organizationEntityId.id,
        apOrganizationSessionInfoDisplay: apSessionInfoDisplay
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  React.useEffect(() => {
    if(selectedBusinessGroupEntityId !== undefined) doSelectBusinessGroup(selectedBusinessGroupEntityId);
  }, [selectedBusinessGroupEntityId]); /* eslint-disable-line react-hooks/exhaustive-deps */


  const doApplyNewBusinessGroup = async(businessGroupEntityId: TAPEntityId) => {
    const funcName = 'doApplyNewBusinessGroup';
    const logName = `${ComponentName}.${funcName}()`;

    props.onLoadingChange(true);

    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = APMemberOfService.get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: props.apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupId: businessGroupEntityId.id
    });

    if(userContext.runtimeSettings.currentOrganizationEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId === undefined`);
    // save session info
    await apiUpdateSession({
      organizationEntityId: userContext.runtimeSettings.currentOrganizationEntityId,
      userEntityId: props.apLoginUserDisplay.apEntityId,
      businessGroupEntityId: businessGroupEntityId
    });

    // set the contexts
    APContextsDisplayService.setup_BusinessGroupContexts_For_LoggedInUser({
      apLoginUserDisplay: props.apLoginUserDisplay,
      apMemberOfBusinessGroupDisplay: apMemberOfBusinessGroupDisplay,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchAuthContextAction: dispatchAuthContextAction
    });

    props.onLoadingChange(false);
    props.onSuccess();
  }

  const doSelectBusinessGroup = (businessGroupEntityId: TAPEntityId) => {
    if(businessGroupEntityId.id === props.currentBusinessGroupEntityId.id) {
      // nothing to do, close me
      return props.onSuccess();
    }
    doApplyNewBusinessGroup(businessGroupEntityId);
  }

  const onSelectBusinessGroup = (businessGroupEntityId: TAPEntityId) => {
    setSelectedBusinessGroupEntityId(businessGroupEntityId);
  }

  const renderComponent = () => {
    return(
      <React.Fragment>
        <p><h2>Select Business Group</h2></p>
        <p><b>Current: {props.currentBusinessGroupEntityId.displayName}</b></p>
        <Divider />
        <SelectBusinessGroup
          apMemberOfBusinessGroupDisplayTreeNodeList={props.apMemberOfBusinessGroupDisplayTreeNodeList}
          currentBusinessGroupEntityId={props.currentBusinessGroupEntityId}
          onSelect={onSelectBusinessGroup}
        />
      </React.Fragment>
    );
  }

  return (
    <div className="businessgroup-select">

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {selectedBusinessGroupEntityId === undefined && renderComponent()}

    </div>
  );
}
