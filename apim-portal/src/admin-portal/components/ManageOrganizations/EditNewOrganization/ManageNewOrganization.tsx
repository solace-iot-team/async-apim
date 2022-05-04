
import React from "react";
import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { Globals } from "../../../../utils/Globals";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APSystemOrganizationsDisplayService, { 
  IAPSystemOrganizationDisplay, 
  IAPSystemOrganizationDisplay_Connectivity, 
  IAPSystemOrganizationDisplay_General 
} from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_NEW } from "../ManageOrganizationsCommon";
import { NewGeneral } from "./NewGeneral";
import { NewConnectivity } from "./NewConnectivity";
import { NewReviewAndCreate } from "./NewReviewAndCreate";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IManageNewOrganizationProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccessNotification: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageNewOrganization: React.FC<IManageNewOrganizationProps> = (props: IManageNewOrganizationProps) => {
  const ComponentName = 'ManageNewOrganization';

  type TManagedObject = IAPSystemOrganizationDisplay;

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
        return setNewComponentState(E_COMPONENT_STATE_NEW.CONNECTIVITY);
      case E_COMPONENT_STATE_NEW.CONNECTIVITY:
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
      case E_COMPONENT_STATE_NEW.CONNECTIVITY:
        return setNewComponentState(E_COMPONENT_STATE_NEW.GENERAL);
      case E_COMPONENT_STATE_NEW.REVIEW:
        return setNewComponentState(E_COMPONENT_STATE_NEW.CONNECTIVITY);
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }


  const ComponentState2TabIndexMap = new Map<E_COMPONENT_STATE_NEW, number>([
    [E_COMPONENT_STATE_NEW.GENERAL, 0],
    [E_COMPONENT_STATE_NEW.CONNECTIVITY, 1],
    [E_COMPONENT_STATE_NEW.REVIEW, 2]
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
  const [showConnectivity, setShowConnectivity] = React.useState<boolean>(false);
  const [showReview, setShowReview] = React.useState<boolean>(false);

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // const [userContext] = React.useContext(UserContext);

  // * Api Calls *

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_ORGANIZATION, 'create empty organization');
    try {
      const empty: TManagedObject = APSystemOrganizationsDisplayService.create_Empty_ApOrganizationDisplay();
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
      label: 'New Organization'
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
      setShowConnectivity(false);
      setShowReview(false);
      return;
    }
    if(componentState.currentState === E_COMPONENT_STATE_NEW.GENERAL) {
      setShowGeneral(true);
      setShowConnectivity(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.CONNECTIVITY) {
      setShowGeneral(false);
      setShowConnectivity(true);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.REVIEW) {
      setShowGeneral(false);
      setShowConnectivity(false);
      setShowReview(true);
    }
    // set the tabIndex
    setActiveTabIndexByComponentState(componentState.currentState);
  }

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onNext_From_General = (apSystemOrganizationDisplay_General: IAPSystemOrganizationDisplay_General) => {
    const funcName = 'onNext_From_General';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APSystemOrganizationsDisplayService.set_ApOrganizationDisplay_General({ 
      apOrganizationDisplay: managedObject,
      apOrganizationDisplay_General: apSystemOrganizationDisplay_General
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Connectivity = (apSystemOrganizationDisplay_Connectivity: IAPSystemOrganizationDisplay_Connectivity) => {
    const funcName = 'onNext_From_Connectivity';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APSystemOrganizationsDisplayService.set_ApOrganizationDisplay_Connectivity({ 
      apOrganizationDisplay: managedObject,
      apOrganizationDisplay_Connectivity: apSystemOrganizationDisplay_Connectivity
    }) as TManagedObject;

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
                apSystemOrganizationDisplay={mo}
                onBack={() => {}}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onNext={onNext_From_General}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Connectivity' disabled={!showConnectivity}>
            <React.Fragment>
              <NewConnectivity
                apSystemOrganizationDisplay={mo}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onNext={onNext_From_Connectivity}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Review & Create' disabled={!showReview}>
            <React.Fragment>
              <NewReviewAndCreate
                apSystemOrganizationDisplay={mo}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onCreateSuccess={onCreateSuccess}
                onLoadingChange={props.onLoadingChange}
                onSuccessNotification={props.onSuccessNotification}
              />
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }
  
  return (
    <div className="manage-organizations">

      <APComponentHeader header={`Create Organization`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderComponent(managedObject)}

    </div>
  );
}
