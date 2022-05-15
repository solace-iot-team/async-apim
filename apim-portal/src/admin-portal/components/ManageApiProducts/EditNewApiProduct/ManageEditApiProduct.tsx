import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay } from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APVersioningDisplayService, { IAPVersionInfo } from "../../../../displayServices/APVersioningDisplayService";
import { TAPManagedAssetBusinessGroupInfo, TAPManagedAssetPublishDestinationInfo } from "../../../../displayServices/APManagedAssetDisplayService";
import { APDisplayBusinessGroupInfo } from "../../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { IAPLifecycleStageInfo } from "../../../../displayServices/APLifecycleStageInfoDisplayService";
import { APIProductAccessLevel } from "@solace-iot-team/apim-connector-openapi-browser";
import { EditGeneral } from "./EditGeneral";
import { EditApis } from "./EditApis";
import { EditPolicies } from "./EditPolicies";
import { EditEnvironments } from "./EditEnvironments";
import { EditAttributes } from "./EditAttributes";
import { EditAccessAndState } from "./EditAccessAndState";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IManageEditApiProductProps {
  organizationId: string;
  apiProductEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onChanged: (apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay) => void;
  onNavigateToCommand: (apiProductEntityId: TAPEntityId) => void;
}

export const ManageEditApiProduct: React.FC<IManageEditApiProductProps> = (props: IManageEditApiProductProps) => {
  const ComponentName = 'ManageEditApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [userContext] = React.useContext(UserContext);

  const [organizationContext] = React.useContext(OrganizationContext);
  const IsSingleApiSelection: boolean = organizationContext.apMaxNumApis_Per_ApiProduct === 1;
  const ApiTabHeader: string = IsSingleApiSelection ? "API" : "API(s)";

  // * Api Calls *

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apiProductEntityId.displayName}`);
    try { 
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await APAdminPortalApiProductsDisplayService.apiGet_AdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apiProductEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id
      });
      // create a suggested next version
      apAdminPortalApiProductDisplay.apVersionInfo.apCurrentVersion = APVersioningDisplayService.create_NextVersion(apAdminPortalApiProductDisplay.apVersionInfo.apLastVersion);
      setManagedObject(apAdminPortalApiProductDisplay);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ManagedEditApiProduct_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.apiProductEntityId);
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([
      {
        label: props.apiProductEntityId.displayName,
        command: ManagedEditApiProduct_onNavigateToCommand
      },
      {
        label: 'Edit'
      }  
    ]);  
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    props.onChanged(managedObject);
    setBreadCrumbItemList();
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onEdit_SaveSuccess = (apiCallState: TApiCallState) => {
    props.onSaveSuccess(apiCallState);
    doInitialize();
  }

  const renderBusinessGroupInfo = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {
    return (
      <APDisplayBusinessGroupInfo
        apManagedAssetBusinessGroupInfo={apManagedAssetBusinessGroupInfo}
        showSharingInfo={true}
      />
    );
  }
  const renderRevisionInfo = (apVersionInfo: IAPVersionInfo): JSX.Element => {
    return (<div><b>Last Revision:</b> {apVersionInfo.apLastVersion}</div>);
  }
  const renderState = (apLifecycleStageInfo: IAPLifecycleStageInfo): JSX.Element => {
    return(<div><b>State: </b>{apLifecycleStageInfo.stage}</div>);
  }
  const renderAccessLevel = (accessLevel: APIProductAccessLevel): JSX.Element => {
    return(<div><b>Access: </b>{accessLevel}</div>);
  }
  const renderPublishDestinationInfo = (apPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo): JSX.Element => {
    const renderValue = (apExternalSystemEntityIdList: TAPEntityIdList): string => {
      if(apExternalSystemEntityIdList.length === 0) return 'Not Published.';
      return APEntityIdsService.create_SortedDisplayNameList(apExternalSystemEntityIdList).join(', ');
    }
    return(
      <span><b>Publish Destination(s): </b>{renderValue(apPublishDestinationInfo.apExternalSystemEntityIdList)}</span>
    );
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <React.Fragment>
        {renderBusinessGroupInfo(mo.apBusinessGroupInfo)}
        {renderRevisionInfo(mo.apVersionInfo)}
        {renderState(mo.apLifecycleStageInfo)}
        {renderAccessLevel(mo.apAccessLevel)}
        {renderPublishDestinationInfo(mo.apPublishDestinationInfo)}
      </React.Fragment>
    );
  }

  const renderTabPanels = (): Array<JSX.Element> => {
    const funcName = 'renderTabPanels';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const tabPanels: Array<JSX.Element> = [];

    tabPanels.push(
      <TabPanel header='General'>
        <React.Fragment>
          <EditGeneral
            organizationId={props.organizationId}
            apAdminPortalApiProductDisplay={managedObject}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </React.Fragment>
      </TabPanel>  
    );
    tabPanels.push(
      <TabPanel header={ApiTabHeader}>
        <React.Fragment>
          <EditApis
            organizationId={props.organizationId}
            apAdminPortalApiProductDisplay={managedObject}
            isSingleApiSelection={IsSingleApiSelection}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </React.Fragment>
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='Policies'>
        <React.Fragment>
          <EditPolicies
            organizationId={props.organizationId}
            apAdminPortalApiProductDisplay={managedObject}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </React.Fragment>
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='Environments'>
        <React.Fragment>
          <EditEnvironments
            organizationId={props.organizationId}
            apAdminPortalApiProductDisplay={managedObject}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </React.Fragment>
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='Attributes'>
        <React.Fragment>
          <EditAttributes
            organizationId={props.organizationId}
            apAdminPortalApiProductDisplay={managedObject}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </React.Fragment>
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='Access & State'>
        <React.Fragment>
          <EditAccessAndState
            organizationId={props.organizationId}
            apAdminPortalApiProductDisplay={managedObject}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </React.Fragment>
      </TabPanel>
    );
    return tabPanels;
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
          { renderTabPanels() }
        </TabView>
      </React.Fragment>
    ); 
  }

  const renderEditHeader = (): JSX.Element => {
    const funcName = 'renderEditHeader';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const getHeaderNotes = (): string | undefined => {
      if(managedObject.apAppReferenceEntityIdList.length === 0) return 'Not used by any Apps.';
      return `Used by ${managedObject.apAppReferenceEntityIdList.length} App(s).`;
    }  
    return(
      <React.Fragment>
        <APComponentHeader 
          header={`Edit: ${managedObject.apEntityId.displayName}`} 
          notes={getHeaderNotes()}
        />
      </React.Fragment>
    );
  }

  return (
    <div className="manage-api-products">

      { managedObject && renderEditHeader() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && renderContent() }

    </div>
  );

}