
import React from "react";
import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { Globals } from "../../../../utils/Globals";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { EAction, E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_NEW } from "../ManageApiProductsCommon";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { 
  TAPApiProductDisplay_Apis, 
  TAPApiProductDisplay_Environments, 
  TAPApiProductDisplay_General, 
  TAPApiProductDisplay_Policies 
} from "../../../../displayServices/APApiProductsDisplayService";
import { TAPManagedAssetBusinessGroupInfo, TAPManagedAssetDisplay_Attributes } from "../../../../displayServices/APManagedAssetDisplayService";
import { EditNewGeneral } from "./EditNewGeneral";
import { NewReviewAndCreate } from "./NewReviewAndCreate";
import { EditNewPolicies } from "./EditNewPolicies";
import { EditNewApis } from "./EditNewApis";
import { EditNewEnvironments } from "./EditNewEnvironments";
import { EditNewAttributes } from "./EditNewAttributes";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";
import APVersioningDisplayService from "../../../../displayServices/APVersioningDisplayService";

export interface IManageNewApiProductProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccessNotification: (apiCallState: TApiCallState) => void;
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
        return setNewComponentState(E_COMPONENT_STATE_NEW.POLICIES);
      case E_COMPONENT_STATE_NEW.POLICIES:
        return setNewComponentState(E_COMPONENT_STATE_NEW.ENVIRONMENTS);
      case E_COMPONENT_STATE_NEW.ENVIRONMENTS:
        return setNewComponentState(E_COMPONENT_STATE_NEW.ATTRIBUTES);
      case E_COMPONENT_STATE_NEW.ATTRIBUTES:
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
      case E_COMPONENT_STATE_NEW.POLICIES:
        return setNewComponentState(E_COMPONENT_STATE_NEW.APIS);
      case E_COMPONENT_STATE_NEW.ENVIRONMENTS:
        return setNewComponentState(E_COMPONENT_STATE_NEW.POLICIES);
      case E_COMPONENT_STATE_NEW.ATTRIBUTES:
        return setNewComponentState(E_COMPONENT_STATE_NEW.ENVIRONMENTS);
      case E_COMPONENT_STATE_NEW.REVIEW:
        return setNewComponentState(E_COMPONENT_STATE_NEW.ATTRIBUTES);
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }


  const ComponentState2TabIndexMap = new Map<E_COMPONENT_STATE_NEW, number>([
    [E_COMPONENT_STATE_NEW.GENERAL, 0],
    [E_COMPONENT_STATE_NEW.APIS, 1],
    [E_COMPONENT_STATE_NEW.POLICIES, 2],
    [E_COMPONENT_STATE_NEW.ENVIRONMENTS, 3],
    [E_COMPONENT_STATE_NEW.ATTRIBUTES, 4],
    [E_COMPONENT_STATE_NEW.REVIEW, 5]
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
  const [showPolicies, setShowPolicies] = React.useState<boolean>(false);
  const [showEnvironments, setShowEnvironments] = React.useState<boolean>(false);
  const [showAttributes, setShowAttributes] = React.useState<boolean>(false);
  const [showReview, setShowReview] = React.useState<boolean>(false);

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [userContext] = React.useContext(UserContext);

  // * Api Calls *

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_API_PRODUCT, 'create empty api product');
    try {
      const empty: TAPAdminPortalApiProductDisplay = APAdminPortalApiProductsDisplayService.create_Empty_ApAdminPortalApiProductDisplay();
      const _businessGroupInfo: TAPManagedAssetBusinessGroupInfo = {
        apOwningBusinessGroupEntityId: userContext.runtimeSettings.currentBusinessGroupEntityId
      };
      APAdminPortalApiProductsDisplayService.set_ApBusinessGroupInfo({
        apManagedAssetDisplay: empty,
        apManagedAssetBusinessGroupInfo: _businessGroupInfo
      });
      // set the owner info
      APAdminPortalApiProductsDisplayService.set_ApOwnerInfo({
        apManagedAssetDisplay: empty,
        apOwnerInfo: userContext.apLoginUserDisplay.apEntityId
      });
      // create a suggested next version
      empty.apVersionInfo.apCurrentVersion = APVersioningDisplayService.create_NewVersion();
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
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowReview(false);
      return;
    }
    if(componentState.currentState === E_COMPONENT_STATE_NEW.GENERAL) {
      setShowGeneral(true);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.APIS) {
      setShowGeneral(false);
      setShowApis(true);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.POLICIES) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(true);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.ENVIRONMENTS) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(true);
      setShowAttributes(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.ATTRIBUTES) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(true);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.REVIEW) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowReview(true);
    }
    // set the tabIndex
    setActiveTabIndexByComponentState(componentState.currentState);
  }

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onNext_From_General = (apApiProductDisplay_General: TAPApiProductDisplay_General) => {
    const funcName = 'onNext_From_General';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApiProductDisplay_General({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_General: apApiProductDisplay_General
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Apis = (apApiProductDisplay_Apis: TAPApiProductDisplay_Apis) => {
    const funcName = 'onNext_From_Apis';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Apis({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Apis: apApiProductDisplay_Apis
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Policies = (apApiProductDisplay_Policies: TAPApiProductDisplay_Policies) => {
    const funcName = 'onNext_From_Policies';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Policies({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Policies: apApiProductDisplay_Policies
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Environments = (apApiProductDisplay_Environments: TAPApiProductDisplay_Environments) => {
    const funcName = 'onNext_From_Environments';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Environments({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Environments: apApiProductDisplay_Environments
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Attributes = (apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes) => {
    const funcName = 'onNext_From_Attributes';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApManagedAssetDisplay_Attributes({ 
      apManagedAssetDisplay: managedObject,
      apManagedAssetDisplay_Attributes: apManagedAssetDisplay_Attributes
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

  const renderBusinessGroupInfo = (mo: TManagedObject): JSX.Element => {
    return(
      <div className="p-mt-4">
        <span><b>Business Group:</b> {mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}</span>
      </div>
    );
  }

  const renderComponent = (mo: TManagedObject) => {

    return (
      <React.Fragment>
        <div>
          {renderBusinessGroupInfo(mo)}
        </div>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General' disabled={!showGeneral}>
            <React.Fragment>
              <EditNewGeneral
                action={EAction.NEW}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_General}
                onBack={() => {}}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='APIs' disabled={!showApis}>
            <React.Fragment>
              <EditNewApis
                action={EAction.NEW}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_Apis}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Policies' disabled={!showPolicies}>
            <React.Fragment>
              <EditNewPolicies
                action={EAction.NEW}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_Policies}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Environments' disabled={!showEnvironments}>
            <React.Fragment>
              <EditNewEnvironments
                action={EAction.NEW}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_Environments}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Attributes' disabled={!showAttributes}>
            <React.Fragment>
              <EditNewAttributes
                action={EAction.NEW}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_Attributes}
                onBack={onBack} 
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Review & Create' disabled={!showReview}>
            <React.Fragment>
              <NewReviewAndCreate              
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
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
    <div className="manage-api-products">

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
