
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
  TAPMemberOfBusinessGroupDisplayTreeNodeList
 } from "../../displayServices/APUsersDisplayService/APMemberOfService";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";
import { SelectBusinessGroup } from "./SelectBusinessGroup";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageBusinessGroupSelectCommon";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";

import '../APComponents.css';
import "./ManageBusinessGroupSelect.css";
import { TAPUserOrganizationSessionDisplay } from "../../displayServices/APUsersDisplayService/APUsersDisplayService";

export interface IManageBusinessGroupSelectProps {
  apLoginUserDisplay: TAPLoginUserDisplay;
  apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList;
  currentBusinessGroupEntityId: TAPEntityId;
  onSuccess: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageBusinessGroupSelect: React.FC<IManageBusinessGroupSelectProps> = (props: IManageBusinessGroupSelectProps) => {
  const ComponentName = 'ManageBusinessGroupSelect';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);  
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  const apiUpdateSession = async({ organizationEntityId, userEntityId, businessGroupEntityId }: {
    organizationEntityId: TAPEntityId;
    userEntityId: TAPEntityId;
    businessGroupEntityId: TAPEntityId;
  }): Promise<TApiCallState> => {
    const funcName = 'apiUpdateSession';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_SESSION, `update session for user: ${userEntityId.id}`);
    try {
      const apUserOrganizationSessionDisplay: TAPUserOrganizationSessionDisplay = {
        organizationEntityId: organizationEntityId,
        apUserOrganizationSession: {
          businessGroupEntityId: businessGroupEntityId
        }
      };
      await APLoginUsersDisplayService.apsUpdate_ApUserOrganizationSessionDisplay({
        userEntityId: userEntityId,
        apUserOrganizationSessionDisplay: apUserOrganizationSessionDisplay
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doApplyNewBusinessGroup = async(businessGroupEntityId: TAPEntityId) => {
    const funcName = 'doApplyNewBusinessGroup';
    const logName = `${ComponentName}.${funcName}()`;

    props.onLoadingChange(true);

    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = APMemberOfService.get_ApMemberOfBusinessGroupDisplay_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
      apMemberOfBusinessGroupDisplayTreeNodeList: props.apMemberOfBusinessGroupDisplayTreeNodeList,
      businessGroupEntityId: businessGroupEntityId
    });

    // save session info
    if(userContext.runtimeSettings.currentOrganizationEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId === undefined`);
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

  const onSelectBusinessGroup = (businessGroupEntityId: TAPEntityId) => {
    if(businessGroupEntityId.id === props.currentBusinessGroupEntityId.id) {
      // nothing to do, close me
      return props.onSuccess();
    }
    doApplyNewBusinessGroup(businessGroupEntityId);
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

      {renderComponent()}

    </div>
  );
}
