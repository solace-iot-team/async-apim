
import React from "react";
import { useHistory } from 'react-router-dom';

import { TabPanel, TabView } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { Dropdown, DropdownChangeParams } from "primereact/dropdown";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APDisplayClientOptions } from "../../../components/APDisplay/APDisplayClientOptions";
import APEntityIdsService, { 
  TAPEntityId,
  TAPEntityIdList 
} from "../../../utils/APEntityIdsService";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay } from "../../displayServices/APAdminPortalApiProductsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";
import { TAPManagedAssetBusinessGroupInfo, TAPManagedAssetPublishDestinationInfo } from "../../../displayServices/APManagedAssetDisplayService";
import { APDisplayApAttributeDisplayList } from "../../../components/APDisplay/APDisplayApAttributeDisplayList";
import { APDisplayApControlledChannelParameters } from "../../../components/APDisplay/APDisplayApControlledChannelParameters";
import { Config } from "../../../Config";
import { EUIAdminPortalResourcePaths, Globals } from "../../../utils/Globals";
import APVersioningDisplayService from "../../../displayServices/APVersioningDisplayService";
import APMetaInfoDisplayService from "../../../displayServices/APMetaInfoDisplayService";
import { APIProductAccessLevel, MetaEntityReference } from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPAttributeDisplayList } from "../../../displayServices/APAttributesDisplayService/APAttributesDisplayService";
import { APDisplayBusinessGroupInfo } from "../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { IAPLifecycleStageInfo } from "../../../displayServices/APLifecycleStageInfoDisplayService";
import { OrganizationContext } from "../../../components/APContextProviders/APOrganizationContextProvider";
import { DisplayAppReferenceList } from "./DisplayAppReferenceList";
import { E_AP_Navigation_Scope, TAPPageNavigationInfo } from "../../../displayServices/APPageNavigationDisplayUtils";
import APApiSpecsDisplayService, { TAPApiSpecDisplay } from "../../../displayServices/APApiSpecsDisplayService";
import { APDisplayApiProductApis } from "../../../components/APDisplay/APDisplayApiProductApis";
import { IAPApiDisplay } from "../../../displayServices/APApisDisplayService";
// import { APDisplayApiProductDocumentation } from "../../../components/APDisplay/APDisplayApiProductDocumentation";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export enum E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE {
  REVIEW_AND_CREATE = "REVIEW_AND_CREATE",
  VIEW_EXISTING = "VIEW_EXISTING",
  VIEW_REFEREMCED_BY = "VIEW_REFEREMCED_BY",
  VIEW_EXISTING_MAINTAIN = "VIEW_EXISTING_MAINTAIN"
}

export interface IDisplayAdminPortalApiProductProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  scope: E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE;
  onSuccess: (apiCallState: TApiCallState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  apPageNavigationInfo?: TAPPageNavigationInfo;
}

export const DisplayAdminPortalApiProduct: React.FC<IDisplayAdminPortalApiProductProps> = (props: IDisplayAdminPortalApiProductProps) => {
  const ComponentName = 'DisplayAdminPortalApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [showApiId, setShowApiId] = React.useState<string>();
  const [apiSpec, setApiSpec] = React.useState<TAPApiSpecDisplay>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showApiSpecRefreshCounter, setShowApiSpecRefreshCounter] = React.useState<number>(0);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  // version
  const [selectedRevision, setSelectedRevision] = React.useState<string>();

  const [organizationContext] = React.useContext(OrganizationContext);
  const IsSingleApiSelection: boolean = organizationContext.apMaxNumApis_Per_ApiProduct === 1;
  const ApiTabHeader: string = IsSingleApiSelection ? "API" : "API(s)";
  const viewAppReferenceHistory = useHistory<TAPPageNavigationInfo>();
  const ReferencedByTabIndex: number = 5;

  // * Api Calls *
  const apiGetManagedObject = async(revision: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apAdminPortalApiProductDisplay.apEntityId.displayName}, revision: ${revision}`);
    try { 
      const object: TAPAdminPortalApiProductDisplay = await APAdminPortalApiProductsDisplayService.apiGet_AdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apAdminPortalApiProductDisplay.apEntityId.id,
        default_ownerId: props.apAdminPortalApiProductDisplay.apOwnerInfo.id,
        fetch_revision_list: true,
        revision: revision,
      });
      setManagedObject(object);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetApiSpec = async(apiId: string, apiDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetApiSpec';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_SPEC, `retrieve api spec: ${apiDisplayName}`);
    try {
      switch(props.scope) {
        case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING:
        case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_REFEREMCED_BY:
        case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING_MAINTAIN:
          const apiProductApiSpec: TAPApiSpecDisplay = await APApiSpecsDisplayService.apiGet_ApiProduct_ApiSpec({
            organizationId: props.organizationId, 
            apiProductId: managedObject.apEntityId.id,
            apiEntityId: { id: apiId, displayName: apiDisplayName }
          });
          setApiSpec(apiProductApiSpec);
          break;
        case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.REVIEW_AND_CREATE:
          const apiApiSpec: TAPApiSpecDisplay= await APApiSpecsDisplayService.apiGet_Api_ApiSpec({
            organizationId: props.organizationId,
            apiEntityId: { id: apiId, displayName: apiDisplayName }
          });
          setApiSpec(apiApiSpec);
          break;
        default:
          Globals.assertNever(logName, props.scope);
      }
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(props.apAdminPortalApiProductDisplay);
  }

  const doFetchRevision = async (revision: string) => {
    props.onLoadingChange(true);
    await apiGetManagedObject(revision);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setSelectedRevision(managedObject.apVersionInfo.apCurrentVersion);
    if(props.apPageNavigationInfo !== undefined && props.apPageNavigationInfo.apNavigationTarget.scope === E_AP_Navigation_Scope.ORIGIN) {
      // alert(`${ComponentName}: props.apPageNavigationInfo=${JSON.stringify(props.apPageNavigationInfo, null, 2)}`);
      if(props.apPageNavigationInfo.apNavigationTarget.tabIndex !== undefined) setTabActiveIndex(props.apPageNavigationInfo.apNavigationTarget.tabIndex);
    }
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(selectedRevision === undefined) return;
    if(managedObject === undefined) return;
    if(selectedRevision !== managedObject.apVersionInfo.apCurrentVersion) doFetchRevision(selectedRevision);
  }, [selectedRevision]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiSpec === undefined) return;
    setShowApiSpecRefreshCounter(showApiSpecRefreshCounter + 1);
  }, [apiSpec]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doFetchApiSpec = async (apiId: string) => {
    props.onLoadingChange(true);
    await apiGetApiSpec(apiId, apiId);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    if(showApiId === undefined) return;
    doFetchApiSpec(showApiId);
  }, [showApiId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onViewAppReference = (appEntityId: TAPEntityId) => {
    if(props.scope === E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING) {
      viewAppReferenceHistory.push({       
        pathname: EUIAdminPortalResourcePaths.ManageOrganizationApps,
        state: {
          apNavigationTarget: {
            apEntityId: appEntityId,
            scope: E_AP_Navigation_Scope.LINKED,
          },
          apNavigationOrigin: {
            breadcrumbLabel: 'API Products',
            apOriginPath: EUIAdminPortalResourcePaths.ManageOrganizationApiProducts,
            apEntityId: props.apAdminPortalApiProductDisplay.apEntityId,
            tabIndex: ReferencedByTabIndex,
            scope: E_AP_Navigation_Scope.ORIGIN,
          }
        }
      });
    }
  }

  const onShowApiSpec = (apApiDisplay: IAPApiDisplay) => {
    setShowApiId(apApiDisplay.apEntityId.id);
  }

  const renderBusinessGroupInfo = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {
    return (
      <APDisplayBusinessGroupInfo
        apManagedAssetBusinessGroupInfo={apManagedAssetBusinessGroupInfo}
        showSharingInfo={true}
      />
    );
  }

  const renderOwner = (apOwnerInfo: TAPEntityId): JSX.Element => {
    if(props.scope === E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING) {
      return (
        <div><b>Owner</b>: {apOwnerInfo.displayName}</div>
      );
    } else return (<></>);
  }

  const renderRevisionSelect = (): JSX.Element => {
    const funcName = 'renderRevisionSelect';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);
    if(managedObject.apVersionInfo.apVersionList === undefined) throw new Error(`${logName}: managedObject.apVersionInfo.apVersionList is undefined`);

    const onRevisionSelect = (e: DropdownChangeParams) => {
      setSelectedRevision(e.value);
    }
    const isSelectRevisionDisabled: boolean = props.scope === E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_REFEREMCED_BY;
    return(
      <Dropdown
        value={selectedRevision}
        options={APVersioningDisplayService.get_Sorted_ApVersionList(managedObject.apVersionInfo.apVersionList)}
        onChange={onRevisionSelect}
        disabled={isSelectRevisionDisabled}
      />                          
    );
  }

  const renderRevision = (mo: TManagedObject): JSX.Element => {
    const funcName = 'renderRevision';
    const logName = `${ComponentName}.${funcName}()`;
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING:
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_REFEREMCED_BY:
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING_MAINTAIN:
        return (
          <div><b>Revision: </b>{renderRevisionSelect()}</div>
        );
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.REVIEW_AND_CREATE:
        return (
          <div><b>New Revision: {mo.apVersionInfo.apCurrentVersion}</b></div>
        );
      default:
        Globals.assertNever(logName, props.scope);
    }
    return (<></>);
  }

  const renderState = (apLifecycleStageInfo: IAPLifecycleStageInfo): JSX.Element => {
    return(
      <span><b>State: </b>{apLifecycleStageInfo.stage}</span>
    );
  }

  const renderAccessLevel = (accessLevel: APIProductAccessLevel): JSX.Element => {
    return(
      <span><b>Access: </b>{accessLevel}</span>
    );
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
      <div className="p-col-12">
        <div className="api-product-view">
          <div className="api-product-view-detail-left">

            <div>{renderBusinessGroupInfo(mo.apBusinessGroupInfo)}</div>
            <div>{renderOwner(mo.apOwnerInfo)}</div>
            <div>{renderState(mo.apLifecycleStageInfo)}</div>
            <div>{renderAccessLevel(mo.apAccessLevel)}</div>
            <div>{renderPublishDestinationInfo(mo.apPublishDestinationInfo)}</div>

            {/* DEBUG */}
            {/* <div><b>DEVEL: Current Version</b>: {mo.apVersionInfo.apCurrentVersion}, Last Version: {mo.apVersionInfo.apLastVersion}</div> */}

          </div>
          <div className="api-product-view-detail-right">
            <div>{renderRevision(mo)}</div>
          </div>            
        </div>
      </div>  
    );
  }

  const renderMeta = (mo: TManagedObject): JSX.Element => {
    if(props.scope === E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.REVIEW_AND_CREATE) return (<></>);
    const renderDerivedFrom = (derivedFrom?: MetaEntityReference): JSX.Element => {
      if(derivedFrom === undefined) return (<></>);
      const _name: string | undefined = derivedFrom.displayName !== undefined ? derivedFrom.displayName : derivedFrom.name;
      return (<div>Cloned from: {`${_name} (${derivedFrom.revision})`}</div>);
    }
    return (
      <React.Fragment>  
        <div>Created by: {mo.apMetaInfo.apCreatedBy}</div>
        <div>Created on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(mo.apMetaInfo.apCreatedOn)}</div>
        <div>Last Modified by: {mo.apMetaInfo.apLastModifiedBy}</div>
        <div>Last Modified on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(mo.apMetaInfo.apLastModifiedOn)}</div>        
        { renderDerivedFrom(mo.apMetaInfo.apDerivedFrom) }
        {/* <div>Clones: TODO: list of id/displaynames? - needs another API call</div> */}
      </React.Fragment>
    );
  }

  const renderDevelAttributeList = (mo: TManagedObject): JSX.Element => {
    const funcName = 'renderDevelAttributeList';
    const logName = `${ComponentName}.${funcName}()`;
    let apAttributeDisplayList: TAPAttributeDisplayList = [];
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING:
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_REFEREMCED_BY:
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING_MAINTAIN:
        apAttributeDisplayList = mo.devel_display_complete_ApAttributeList;
        break;
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.REVIEW_AND_CREATE:
        apAttributeDisplayList = []
        break;
      default:
        Globals.assertNever(logName, props.scope);
    }
    return (
      <APDisplayApAttributeDisplayList
        apAttributeDisplayList={apAttributeDisplayList}
        tableRowHeader_AttributeName="Devel Attribute"
        tableRowHeader_AttributeValue="Value"
        emptyMessage="No attributes defined"
        className="p-ml-4"
      />
    );
  }

  const renderTabPanels = (): Array<JSX.Element> => {
    const funcName = 'renderTabPanels';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const tabPanels: Array<JSX.Element> = [];

    tabPanels.push(
      <TabPanel header='General'>
        <div className="p-col-12">
          <div className="api-product-view">
            <div className="api-product-view-detail-left">

              <div className="p-text-bold">Description:</div>
              <div className="p-ml-2">{managedObject.apDescription}</div>

            </div>
            <div className="api-product-view-detail-right">
              <div>Id: {managedObject.apEntityId.id}</div>
              {renderMeta(managedObject)}
            </div>            
          </div>
        </div>  
      </TabPanel>
    );
    // tabPanels.push(
    //   <TabPanel header='Documentation'>
    //     <APDisplayApiProductDocumentation
    //       apApiProductDocumentationDisplay={managedObject.apApiProductDocumentationDisplay}
    //       className="p-ml-4"
    //     />
    //   </TabPanel>
    // );
    tabPanels.push(
      <TabPanel header={ApiTabHeader}>
        <React.Fragment>
          <div>
            <APDisplayApiProductApis 
              apApiDisplayList={managedObject.apApiDisplayList}
              onDisplayApiSpec={onShowApiSpec}
              className="p-ml-4"
            />
            <APDisplayApControlledChannelParameters
              apControlledChannelParameterList={managedObject.apControlledChannelParameterList}
              emptyMessage="No controlled channel parameters defined"
              className="p-ml-4 p-mt-4"
            />
          </div>
          {apiSpec && showApiId &&
            <React.Fragment>
              <APDisplayAsyncApiSpec 
                key={`${ComponentName}_APDisplayAsyncApiSpec_${showApiSpecRefreshCounter}`}
                schema={apiSpec.spec} 
                schemaId={showApiId} 
                onDownloadSuccess={props.onSuccess}
                onDownloadError={props.onError}

                // fetchZipContentsFunc={}

              />
            </React.Fragment>  
          }
        </React.Fragment>
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='Policies'>
        <React.Fragment>
          <div><b>Approval type</b>: {managedObject.apApprovalType}</div>
          {/* <div className="p-text-bold">Client Options:</div> */}
          <APDisplayClientOptions
            apClientOptionsDisplay={managedObject.apClientOptionsDisplay}
            className="p-mt-2"
          />
        </React.Fragment>
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='Environments'>
        <React.Fragment>
          <div className="p-text-bold">Environments:</div>
          <div className="p-ml-2">
            {APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(managedObject.apEnvironmentDisplayList).join(', ')}
          </div>
          <div className="p-text-bold">Protocols:</div>
          <div className="p-ml-2">
            {APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(managedObject.apProtocolDisplayList).join(', ')}
          </div>
        </React.Fragment>
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='Attributes'>
        <React.Fragment>
          <div className="p-text-bold">General Attributes:</div>
          <APDisplayApAttributeDisplayList
            apAttributeDisplayList={managedObject.apExternal_ApAttributeDisplayList}
            tableRowHeader_AttributeName="Attribute"
            tableRowHeader_AttributeValue="Value"  
            emptyMessage="No attributes defined"
            className="p-ml-4"
          />
          {Config.getUseDevelTools() &&
            <React.Fragment>
              <Divider />
              <div className="p-text-bold">DEVEL: All Attributes for cross checking:</div>
              {renderDevelAttributeList(managedObject)}
            </React.Fragment>
          }
        </React.Fragment>
      </TabPanel>
    );
    if(props.scope !== E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.REVIEW_AND_CREATE) {
      tabPanels.push(
        <TabPanel header='Referenced By'>
          <div className="p-ml-2">
            <DisplayAppReferenceList
              organizationId={props.organizationId}
              apAdminPortalApiProductDisplay={managedObject}
              onSuccess={props.onSuccess}
              onError={props.onError}
              onViewAppReference={onViewAppReference}
            />
          </div>
        </TabPanel>
      );  
    } 
    return tabPanels;
  }


  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <React.Fragment>

        {renderHeader(managedObject)}

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>

          { renderTabPanels() }

        </TabView> 
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="manage-api-products">

        {props.scope === E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING && managedObject && 
          <APComponentHeader header={`API Product: ${managedObject.apEntityId.displayName}`} />
        }

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {/* <div>DEBUG: selectedVersion = '{selectedVersion}'</div>
        <div>DEBUG: managedObject.apVersionInfo={JSON.stringify(managedObject?.apVersionInfo)}</div> */}

        {/* DEBUG */}
        {/* <pre>props.scope={JSON.stringify(props.scope)}</pre> */}
        {/* <pre>props.apPageNavigationInfo={JSON.stringify(props.apPageNavigationInfo)}</pre> */}

        {managedObject && selectedRevision !== undefined && renderManagedObject() }

      </div>
    </React.Fragment>
  );
}
