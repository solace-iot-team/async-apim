
import React from "react";
import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { Globals } from "../../../../utils/Globals";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_NEW } from "../ManageApiProductsCommon";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay, TAPAdminPortalApiProductDisplay_General } from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { NewGeneral } from "./NewGeneral";
import { NewApis } from "./NewApis";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IManageNewApiProductProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManagedNewApiProduct: React.FC<IManageNewApiProductProps> = (props: IManageNewApiProductProps) => {
  const ComponentName = 'ManagedNewApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay;

  type TComponentState = {
    previousState: E_COMPONENT_STATE_NEW,
    currentState: E_COMPONENT_STATE_NEW
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE_NEW.UNDEFINED,
    currentState: E_COMPONENT_STATE_NEW.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE_NEW) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  const setNextComponentState = () => {
    const funcName = 'setNextComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(componentState.currentState) {
      case E_COMPONENT_STATE_NEW.UNDEFINED:
        return setNewComponentState(E_COMPONENT_STATE_NEW.GENERAL);
      case E_COMPONENT_STATE_NEW.GENERAL:
        return setNewComponentState(E_COMPONENT_STATE_NEW.APIS);
      case E_COMPONENT_STATE_NEW.APIS:
        return setNewComponentState(E_COMPONENT_STATE_NEW.OTHER);
      case E_COMPONENT_STATE_NEW.OTHER:
        return setNewComponentState(E_COMPONENT_STATE_NEW.REVIEW);
      case E_COMPONENT_STATE_NEW.REVIEW:
        return;
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }
  const setPreviousComponentState = () => {
    const funcName = 'setPreviousComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(componentState.currentState) {
      case E_COMPONENT_STATE_NEW.UNDEFINED:
      case E_COMPONENT_STATE_NEW.GENERAL:
        return;
      case E_COMPONENT_STATE_NEW.APIS:
        return setNewComponentState(E_COMPONENT_STATE_NEW.GENERAL);
      case E_COMPONENT_STATE_NEW.OTHER:
        return setNewComponentState(E_COMPONENT_STATE_NEW.APIS);
      case E_COMPONENT_STATE_NEW.REVIEW:
        return setNewComponentState(E_COMPONENT_STATE_NEW.OTHER);
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }


  const ComponentState2TabIndexMap = new Map<E_COMPONENT_STATE_NEW, number>([
    [E_COMPONENT_STATE_NEW.GENERAL, 0],
    [E_COMPONENT_STATE_NEW.APIS, 1],
    [E_COMPONENT_STATE_NEW.OTHER, 2],
    [E_COMPONENT_STATE_NEW.REVIEW, 3]
  ]);

  const setActiveTabIndexByComponentState = (state: E_COMPONENT_STATE_NEW) => {
    const funcName = 'setActiveTabIndexByComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    const idx = ComponentState2TabIndexMap.get(state);
    if(idx === undefined) throw new Error(`${logName}: idx === undefined, state=${state}`);
    setTabActiveIndex(idx);
  }

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [showGeneral, setShowGeneral] = React.useState<boolean>(false);
  const [showApis, setShowApis] = React.useState<boolean>(false);
  const [showOther, setShowOther] = React.useState<boolean>(false);
  const [showReview, setShowReview] = React.useState<boolean>(false);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_API_PRODUCT, 'create empty api product');
    try {
      const empty: TAPAdminPortalApiProductDisplay = APAdminPortalApiProductsDisplayService.create_Empty_ApAdminPortalApiProductDisplay();
      setManagedObject(empty);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
    setNewComponentState(E_COMPONENT_STATE_NEW.GENERAL);  
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: 'New API Product'
    }]);
    doInitialize()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const calculateShowStates = (componentState: TComponentState) => {
    if(componentState.currentState === E_COMPONENT_STATE_NEW.UNDEFINED) {
      setShowGeneral(false);
      setShowApis(false);
      setShowOther(false);
      setShowReview(false);
      return;
    }
    if(componentState.currentState === E_COMPONENT_STATE_NEW.GENERAL) {
      setShowGeneral(true);
      setShowApis(false);
      setShowOther(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.APIS) {
      setShowGeneral(false);
      setShowApis(true);
      setShowOther(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.OTHER) {
      setShowGeneral(false);
      setShowApis(false);
      setShowOther(true);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.REVIEW) {
      setShowGeneral(false);
      setShowApis(false);
      setShowOther(false);
      setShowReview(true);
    }
    // set the tabIndex
    setActiveTabIndexByComponentState(componentState.currentState);
  }

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onNext_From_General = (apAdminPortalApiProductDisplay_General: TAPAdminPortalApiProductDisplay_General) => {
    const funcName = 'onNext_From_General';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    // TODO: implement here
    // const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApAdminPortalApiProductDisplay_General({ apOrganizationUserDisplay: managedObject, apUserProfileDisplay: apUserProfileDisplay });

    alert(`${logName}: set in object apAdminPortalApiProductDisplay_General=${JSON.stringify(apAdminPortalApiProductDisplay_General, null, 2)}`);
    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.create_Empty_ApAdminPortalApiProductDisplay();

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Apis = (x: string) => {
    const funcName = 'onNext_From_Apis';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    alert(`${logName}: set in object, x=${x}`);
    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.create_Empty_ApAdminPortalApiProductDisplay();

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Other = () => {
    const funcName = 'onNext_From_Other';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    alert(`${logName}: creating empty object again ...`);
    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.create_Empty_ApAdminPortalApiProductDisplay();

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onBack = () => {
    setPreviousComponentState();
  }

  const onCreateSuccess = (apiCallState: TApiCallState, apiProductEntityId: TAPEntityId) => {
    props.onNewSuccess(apiCallState, apiProductEntityId);
  }

  const renderComponent = (mo: TManagedObject) => {

    return (
      <React.Fragment>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General' disabled={!showGeneral}>
            <React.Fragment>
              <NewGeneral
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onBack={() => {}}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onNext={onNext_From_General}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='APIs' disabled={!showApis}>
            <React.Fragment>
              <NewApis
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onNext={onNext_From_Apis}
                />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Other' disabled={!showOther}>
            <React.Fragment>
              <p>TODO: NewOther</p>
              {/* <NewOrganizationUserRolesAndGroups 
                apOrganizationUserDisplay={mo}
                onNext={onNext_From_RolesAndGroups}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
              /> */}
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Review & Create' disabled={!showReview}>
            <React.Fragment>
            <p>TODO: NewReviewAndCreate</p>
              {/* <NewOrganizationUserReviewAndCreate
                apOrganizationUserDisplay={mo}
                onCreateSuccess={onCreateSuccess}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
              /> */}
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }
  
  return (
    <div className="manage-users">

      <APComponentHeader header={`Create New API Product`} />

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
