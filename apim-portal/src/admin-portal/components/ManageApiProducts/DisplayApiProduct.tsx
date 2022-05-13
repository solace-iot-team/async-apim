
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
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
import APApiSpecsDisplayService, { TAPApiSpecDisplay } from "../../../displayServices/APApiSpecsDisplayService";
import { TAPManagedAssetBusinessGroupInfo, TAPManagedAssetPublishDestinationInfo } from "../../../displayServices/APManagedAssetDisplayService";
import { APDisplayApAttributeDisplayList } from "../../../components/APDisplay/APDisplayApAttributeDisplayList";
import { APDisplayApControlledChannelParameters } from "../../../components/APDisplay/APDisplayApControlledChannelParameters";
import { Config } from "../../../Config";
import { APDisplayApisDetails } from "../../../components/APDisplay/APDisplayApisDetails";
import { Globals } from "../../../utils/Globals";
import APVersioningDisplayService from "../../../displayServices/APVersioningDisplayService";
import APMetaInfoDisplayService from "../../../displayServices/APMetaInfoDisplayService";
import { APIProductAccessLevel } from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPAttributeDisplayList } from "../../../displayServices/APAttributesDisplayService/APAttributesDisplayService";
import { APDisplayBusinessGroupInfo } from "../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { IAPLifecycleStageInfo } from "../../../displayServices/APLifecycleStageInfoDisplayService";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export enum E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE {
  REVIEW_AND_CREATE = "REVIEW_AND_CREATE",
  VIEW_EXISTING = "VIEW_EXISTING"
}

export interface IDisplayAdminPortalApiProductProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  scope: E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE;
  onSuccess: (apiCallState: TApiCallState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
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

  const renderShowApiButtons = () => {
    const funcName = 'renderShowApiButtons';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);

    const onShowApi = (event: any): void => {
      setShowApiId(event.currentTarget.dataset.id);
    }
  
    const jsxButtonList: Array<JSX.Element> = [];
    for (const apApiDisplay of managedObject.apApiDisplayList) {
      jsxButtonList.push(
        <Button 
          label={apApiDisplay.apEntityId.displayName} 
          key={apApiDisplay.apEntityId.id} 
          data-id={apApiDisplay.apEntityId.id} 
          // icon="pi pi-folder-open" 
          // className="p-button-text p-button-plain p-button-outlined p-button-rounded" 
          className="p-button-text p-button-plain p-button-outlined" 
          style={{ whiteSpace: 'nowrap' }}          
          onClick={onShowApi}
        />        
      );
    }
    const renderButtons = () => {
      return (
        <div className="p-grid">
          {jsxButtonList}
        </div>
      );
    }
    return (
      <Toolbar         
        style={{ 
          background: 'none',
          border: 'none'
        }} 
        left={renderButtons()}
      />
    );
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

  const render_UsedByApps = (apAppReferenceEntityIdList: TAPEntityIdList): JSX.Element => {
    const funcName = 'render_UsedByApps';
    const logName = `${ComponentName}.${funcName}()`;

    const renderUsedByApps = (apAppReferenceEntityIdList: TAPEntityIdList): JSX.Element => {
      if(apAppReferenceEntityIdList.length === 0) return (<div>None.</div>);
      return (
        <div>
          {APEntityIdsService.create_DisplayNameList(apAppReferenceEntityIdList).join(', ')}
        </div>
      );
    }
  
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING:
        return (
          <React.Fragment>
            <div className="p-text-bold">Used by Apps:</div>
            <div className="p-ml-2">{renderUsedByApps(apAppReferenceEntityIdList)}</div>
          </React.Fragment>
        );
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.REVIEW_AND_CREATE:
        return (<></>);
      default:
        Globals.assertNever(logName, props.scope);
    }
    return (<></>);
  }

  const renderRevisionSelect = (): JSX.Element => {
    const funcName = 'renderRevisionSelect';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);
    if(managedObject.apVersionInfo.apVersionList === undefined) throw new Error(`${logName}: managedObject.apVersionInfo.apVersionList is undefined`);

    const onRevisionSelect = (e: DropdownChangeParams) => {
      setSelectedRevision(e.value);
    }

    return(
      <Dropdown
        value={selectedRevision}
        options={APVersioningDisplayService.get_Sorted_ApVersionList(managedObject.apVersionInfo.apVersionList)}
        onChange={onRevisionSelect}
      />                          
    );
  }

  const renderRevision = (mo: TManagedObject): JSX.Element => {
    const funcName = 'renderRevision';
    const logName = `${ComponentName}.${funcName}()`;
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING:
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
    return (
      <React.Fragment>  
        <div>Created by: {mo.apMetaInfo.apCreatedBy}</div>
        <div>Created on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(mo.apMetaInfo.apCreatedOn)}</div>
        <div>Last Modified by: {mo.apMetaInfo.apLastModifiedBy}</div>
        <div>Last Modifined on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(mo.apMetaInfo.apLastModifiedOn)}</div>
      </React.Fragment>
    );
  }

  const renderDevelAttributeList = (mo: TManagedObject): JSX.Element => {
    const funcName = 'renderDevelAttributeList';
    const logName = `${ComponentName}.${funcName}()`;
    let apAttributeDisplayList: TAPAttributeDisplayList = [];
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING:
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

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <React.Fragment>

        {renderHeader(managedObject)}

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General'>
            <React.Fragment>
            <div className="p-col-12">
              <div className="api-product-view">
                <div className="api-product-view-detail-left">

                  <div className="p-text-bold">Description:</div>
                  <div className="p-ml-2">{managedObject.apDescription}</div>

                  <div>{render_UsedByApps(managedObject.apAppReferenceEntityIdList)}</div>

                </div>
                <div className="api-product-view-detail-right">
                  <div>Id: {managedObject.apEntityId.id}</div>
                  {renderMeta(managedObject)}
                </div>            
              </div>
            </div>  
          </React.Fragment>
          </TabPanel>
          <TabPanel header='APIs'>
            <React.Fragment>
              <div>
                {renderShowApiButtons()}
                <APDisplayApisDetails 
                  apApiDisplayList={managedObject.apApiDisplayList}
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
                  />
                </React.Fragment>  
              }
            </React.Fragment>
          </TabPanel>
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

        {managedObject && selectedRevision !== undefined && renderManagedObject() }

      </div>
    </React.Fragment>
  );
}
