import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay } from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "../ManageApiProductsCommon";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { EditGeneral } from "./EditGeneral";
import { EditPolicies } from "./EditPolicies";
import { EditEnvironments } from "./EditEnvironments";
import { EditAttributes } from "./EditAttributes";
import { EditApis } from "./EditApis";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IManageEditApiProductProps {
  organizationId: string;
  apiProductEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
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
  const [userContext] = React.useContext(UserContext);

  const ManagedEditApiProduct_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW, props.apiProductEntityId);
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
    // setBreadCrumbItemList(props.apiProductEntityId.displayName);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setBreadCrumbItemList(managedObject.apEntityId.displayName);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(managedObjectUpdatedDisplayName === undefined) return;
  //   setBreadCrumbItemList(managedObjectUpdatedDisplayName);
  //   doInitialize();
  // }, [managedObjectUpdatedDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onEdit_SaveSuccess = (apiCallState: TApiCallState) => {
    props.onSaveSuccess(apiCallState);
    doInitialize();
  }


  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div>
        <div>New Component: EditNewVersionForm.tsx =&gt; shows last version as well, user can enter own version. edit validation: semVer format & &gt; last version, new validation: semVer format </div>
        {/* <div>Version: TBD: manage version: system suggests the next minor version automatically, user can override. semVer format, (validate it is correct and greater than current) </div> */}
        <div>Lifecycle: TBD: manage lifecycle: any new version is created as 'draft' </div>
        <div><b>DEVEL: Current Version</b>: {mo.apVersionInfo.apCurrentVersion}, Last Version: {mo.apVersionInfo.apLastVersion}</div>
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
          {renderHeader(managedObject)}
        </div>              

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General'>
            <React.Fragment>
              <EditGeneral
                // key={`${ComponentName}_EditGeneral_${refreshCounter}`}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveSuccess={onEdit_SaveSuccess}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='APIs'>
            <React.Fragment>
              <p>TBD: select APIs: apply restriction in org setting: 1:1 or 1:n)</p>
              <EditApis
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveSuccess={onEdit_SaveSuccess}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Policies'>
            <React.Fragment>
              <EditPolicies
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveSuccess={onEdit_SaveSuccess}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Environments'>
            <React.Fragment>
              <EditEnvironments
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveSuccess={onEdit_SaveSuccess}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Attributes'>
            <React.Fragment>
              {/* <p>TBD: organization defined attributes?</p> */}
              <EditAttributes
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={managedObject}
                onCancel={props.onCancel}
                onError={props.onError}
                onSaveSuccess={onEdit_SaveSuccess}
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

      {managedObject && 
        renderContent()
      }
    </div>
  );

}