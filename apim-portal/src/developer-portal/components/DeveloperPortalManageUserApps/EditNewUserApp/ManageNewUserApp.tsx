
import React from "react";
import { MenuItem } from "primereact/api";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageUserAppsCommon";
import APDeveloperPortalUserAppsDisplayService, { 
  TAPDeveloperPortalUserAppDisplay 
} from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { NewGeneral } from "./NewGeneral";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IManageNewUserAppProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, appEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageNewUserApp: React.FC<IManageNewUserAppProps> = (props: IManageNewUserAppProps) => {
  const ComponentName = 'ManageNewUserApp';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [userContext] = React.useContext(UserContext);

  // * Api Calls * 

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;

    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_USER_APP, `create new app`);
    try { 
      const empty: TAPDeveloperPortalUserAppDisplay = APDeveloperPortalUserAppsDisplayService.create_Empty_ApDeveloperPortalUserAppDisplay({
        userId: userContext.apLoginUserDisplay.apEntityId.id
      });
      setManagedObject(empty);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([{
      label: 'New App'
    }]);  
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    setBreadCrumbItemList();
    doInitialize()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onCreateSuccess = (apiCallState: TApiCallState, appEntityId: TAPEntityId) => {
    props.onNewSuccess(apiCallState, appEntityId);
  }

  const renderComponent = (mo: TManagedObject) => {
    // const funcName = 'renderComponent';
    // const logName = `${ComponentName}.${funcName}()`;

    return (
      <React.Fragment>
        <div className="p-mt-4">
          <NewGeneral
            organizationId={props.organizationId}
            apDeveloperPortalUserAppDisplay={mo}
            onCreateSuccess={onCreateSuccess}
            onCancel={props.onCancel}
            onError={onError_SubComponent}
            onLoadingChange={props.onLoadingChange}
          />
        </div>
        {/* <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General' disabled={!showGeneral}>
            <React.Fragment>
              <NewGeneral
                organizationId={props.organizationId}
                apDeveloperPortalUserAppDisplay={mo}
                onNext={onNext_From_General}
                onBack={() => {}}
                onCancel={props.onCancel}
                onError={onError_SubComponent}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Review & Create' disabled={!showReview}>
            <React.Fragment>
              <p>TODO: NewReviewAndCreate</p>
              <EditNewReviewAndCreate
                action={props.action}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onCreateSuccess={onCreateSuccess}
                onLoadingChange={props.onLoadingChange}
                onUserNotification={props.onUserNotification}
              />
            </React.Fragment>
          </TabPanel>
        </TabView> */}
      </React.Fragment>
    ); 
  }
  
  // const getHeaderNotes = (): string | undefined => {
  //   const funcName = 'getComponentHeader';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   if(original_ManagedObject === undefined) throw new Error(`${logName}: original_ManagedObject === undefined`);
  //   if(props.action === EAction.NEW) return undefined;
  //   if(original_ManagedObject.apAppReferenceEntityIdList.length === 0) return 'Not used by any Apps.';
  //   return `Used by ${original_ManagedObject.apAppReferenceEntityIdList.length} APP(s).`;
  // }

  // const getComponentHeader = (): string => {
  //   const funcName = 'getComponentHeader';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   if(original_ManagedObject === undefined) throw new Error(`${logName}: original_ManagedObject === undefined`);
  
  //   if(props.action === EAction.NEW) return 'Create New API Product';
  //   else return `Edit API Product: ${original_ManagedObject.apEntityId.displayName}`
  // }

  return (
    <div className="apd-manage-user-apps">

      {<APComponentHeader header="Create New App" />}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderComponent(managedObject)}

      {/* DEBUG */}
      {/* {managedObject && 
        <React.Fragment>
          <hr />
          <p><b>{ComponentName}:</b></p>
          <p><b>managedObject.apUserProfileDisplay=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.apUserProfileDisplay, null, 2)}
          </pre>
          <p><b>managedObject.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList, null, 2)}
          </pre>
          <p><b>managedObject.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList, null, 2)}
          </pre>
          <p><b>managedObject.apUserAuthenticationDisplay.password=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.apUserAuthenticationDisplay.password, null, 2)}
          </pre>
        </React.Fragment>
      } */}

    </div>
  );
}
