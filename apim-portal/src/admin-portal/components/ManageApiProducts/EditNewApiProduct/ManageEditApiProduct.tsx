import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay } from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { EAction, E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "../ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { EditNewGeneral } from "./EditNewGeneral";
import { 
  TAPApiProductDisplay_Apis, 
  TAPApiProductDisplay_Environments, 
  TAPApiProductDisplay_General, 
  TAPApiProductDisplay_Policies, 
} from "../../../../displayServices/APApiProductsDisplayService";
import { EditNewApis } from "./EditNewApis";
import { EditNewPolicies } from "./EditNewPolicies";
import { EditNewEnvironments } from "./EditNewEnvironments";
import { EditNewAttributes } from "./EditNewAttributes";
import { TAPManagedAssetDisplay_Attributes } from "../../../../displayServices/APManagedAssetDisplayService";
import APVersioningDisplayService from "../../../../displayServices/APVersioningDisplayService";
import { EditCreateNewVersion } from "./EditCreateNewVersion";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IManageEditApiProductProps {
  organizationId: string;
  apiProductEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onUserFeedback: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToCommand: (componentState: E_COMPONENT_STATE, apiProductEntityId: TAPEntityId) => void;
}

export const ManageEditApiProduct: React.FC<IManageEditApiProductProps> = (props: IManageEditApiProductProps) => {
  const ComponentName = 'ManageEditApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [userContext] = React.useContext(UserContext);

  const ManagedEditApiProduct_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW, props.apiProductEntityId);
  }

  const createCopyOf_ManagedObject = (mo: TManagedObject): TManagedObject => {
    return JSON.parse(JSON.stringify(mo));
  }

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apiProductEntityId.displayName}`);
    try { 
      const object: TAPAdminPortalApiProductDisplay = await APAdminPortalApiProductsDisplayService.apiGet_AdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apiProductEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id
      });
      // create a suggested next version
      object.apVersionInfo.apCurrentVersion = APVersioningDisplayService.create_NextVersion(object.apVersionInfo.apLastVersion);
      setManagedObject(object);
    } catch(e) {
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

  const setBreadCrumbItemList = (moDisplayName: string) => {
    props.setBreadCrumbItemList([
      {
        label: moDisplayName,
        command: ManagedEditApiProduct_onNavigateToCommand
      },
      {
        label: 'Edit'
      }  
    ]);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    setBreadCrumbItemList(props.apiProductEntityId.displayName);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    if(refreshCounter > 0) setApiCallStatus(ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.APPLY_CHANGES, `changes applied for: ${props.apiProductEntityId.displayName}`));
    setRefreshCounter(refreshCounter + 1);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_VERSION_API_PRODUCT) props.onSaveSuccess(apiCallStatus);
      if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.APPLY_CHANGES) props.onUserFeedback(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSuccess_CreateNewVersion = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onSave_From_General = (apApiProductDisplay_General: TAPApiProductDisplay_General) => {
    const funcName = 'onSave_From_General';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const newMo: TManagedObject = createCopyOf_ManagedObject(
      APAdminPortalApiProductsDisplayService.set_ApiProductDisplay_General({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_General: apApiProductDisplay_General
    }) as TManagedObject);

    setManagedObject(newMo);
  }

  const onSave_From_Apis = (apApiProductDisplay_Apis: TAPApiProductDisplay_Apis) => {
    const funcName = 'onSave_From_Apis';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = createCopyOf_ManagedObject(APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Apis({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Apis: apApiProductDisplay_Apis
    }) as TManagedObject);

    setManagedObject(newMo);
  }

  const onSave_From_Policies =  (apApiProductDisplay_Policies: TAPApiProductDisplay_Policies) => {
    const funcName = 'onSave_From_Policies';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = createCopyOf_ManagedObject(APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Policies({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Policies: apApiProductDisplay_Policies
    }) as TManagedObject);

    setManagedObject(newMo);
  }

  const onSave_From_Environments = (apApiProductDisplay_Environments: TAPApiProductDisplay_Environments) => {
    const funcName = 'onSave_From_Environments';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = createCopyOf_ManagedObject(APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Environments({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Environments: apApiProductDisplay_Environments
    }) as TManagedObject);

    setManagedObject(newMo);
  }

  const onSave_From_Attributes = (apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes) => {
    const funcName = 'onSave_From_Attributes';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = createCopyOf_ManagedObject(APAdminPortalApiProductsDisplayService.set_ApManagedAssetDisplay_Attributes({ 
      apManagedAssetDisplay: managedObject,
      apManagedAssetDisplay_Attributes: apManagedAssetDisplay_Attributes
    }) as TManagedObject);

    setManagedObject(newMo);
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div>
        <EditCreateNewVersion
          key={`${ComponentName}_EditCreateNewVersion_${refreshCounter}`}
          organizationId={props.organizationId}
          apAdminPortalApiProductDisplay={mo}
          onCancel={props.onCancel}
          onError={props.onError}
          onLoadingChange={props.onLoadingChange}          
          onCreateVersionSuccess={onSuccess_CreateNewVersion}
        />          
      </div>
    );
  }


  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <React.Fragment>
        <div className="p-mt-2">
          {refreshCounter && renderHeader(managedObject)}
        </div>              

        <TabView className="p-mt-0" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General'>
            <React.Fragment>
              <EditNewGeneral
                // key={`${ComponentName}_EditGeneral_${refreshCounter}`}
                action={EAction.EDIT}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onSave_From_General}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='APIs'>
            <React.Fragment>
              <p>TBD: select APIs: apply restriction in org setting: 1:1 or 1:n)</p>
              <EditNewApis
                action={EAction.EDIT}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveChanges={onSave_From_Apis}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Policies'>
            <React.Fragment>
              <EditNewPolicies
                action={EAction.EDIT}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveChanges={onSave_From_Policies}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Environments'>
            <React.Fragment>
              <EditNewEnvironments
                action={EAction.EDIT}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveChanges={onSave_From_Environments}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Attributes'>
            <React.Fragment>
              {/* <p>TBD: organization defined attributes?</p> */}
              <EditNewAttributes
                action={EAction.EDIT}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveChanges={onSave_From_Attributes}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }

  const getEditNotes = (mo: TManagedObject): string => {
    if(mo.apAppReferenceEntityIdList.length === 0) return 'Not used by any Apps.';
    return `Used by ${mo.apAppReferenceEntityIdList.length} APP(s).`;
  }

  return (
    <div className="manage-api-products">

      {managedObject && 
        <APComponentHeader header={`Edit API Product: ${managedObject.apEntityId.displayName}`} notes={getEditNotes(managedObject)}/>
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && refreshCounter > 0 && 
        renderContent()
      }
    </div>
  );

}