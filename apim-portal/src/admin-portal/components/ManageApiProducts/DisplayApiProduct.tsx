
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { TabPanel, TabView } from "primereact/tabview";

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
import { TAPAdminPortalApiProductDisplay } from "../../displayServices/APAdminPortalApiProductsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";
import APApiSpecsDisplayService, { TAPApiSpecDisplay } from "../../../displayServices/APApiSpecsDisplayService";
import { TAPManagedAssetBusinessGroupInfo } from "../../../displayServices/APManagedAssetDisplayService";
import { APDisplayApAttributeDisplayList } from "../../../components/APDisplay/APDisplayApAttributeDisplayList";
import { APDisplayApControlledChannelParameters } from "../../../components/APDisplay/APDisplayApControlledChannelParameters";
import { Config } from "../../../Config";
import { APDisplayApisDetails } from "../../../components/APDisplay/APDisplayApisDetails";
import { Globals } from "../../../utils/Globals";

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

  // * Api Calls *
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

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const renderBusinessGroup = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {    
    // if(apManagedAssetBusinessGroupInfo.apBusinessGroupDisplayReference === undefined) return(
    //   <span style={{ color: 'red' }}>None.</span>
    // );
    return (
      <span>
        {apManagedAssetBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}
      </span>
    );
  }

  const renderOwner = (apOwnerInfo: TAPEntityId): JSX.Element => {
    return (
      <span>
        {apOwnerInfo.displayName}
      </span>
    );
  }

  const renderVersion = (): JSX.Element => {
    const funcName = 'renderVersion';
    const logName = `${ComponentName}.${funcName}()`;
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING:
        return (<>TBD: Version with dropdown box to select</>);
      case E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.REVIEW_AND_CREATE:
        return (<>TBD: show version number</>);
      default:
        Globals.assertNever(logName, props.scope);
    }
    return (<></>);
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

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return (
      <React.Fragment>
        <div className="p-mt-2">
          <div><b>Version</b>:{renderVersion()}</div>
          <div><b>Lifecycle</b>: TBD: Show Lifecycle status </div>
          <div><b>Business Group</b>: {renderBusinessGroup(managedObject.apBusinessGroupInfo)}</div>
          <div><b>Owner</b>: {renderOwner(managedObject.apOwnerInfo)}</div>
        </div>              

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
                emptyMessage="No attributes defined"
                className="p-ml-4"
              />
            </React.Fragment>
          </TabPanel>
          {Config.getUseDevelTools() &&
          <TabPanel header='DEVEL: Raw Attributes'>
            <React.Fragment>
              <div className="p-text-bold">All Attributes for cross checking:</div>
              <APDisplayApAttributeDisplayList
                apAttributeDisplayList={managedObject.devel_display_complete_ApAttributeList}
                emptyMessage="No attributes defined"
                className="p-ml-4"
              />
            </React.Fragment>
          </TabPanel>
          }
        </TabView> 
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="manage-api-products">

        {managedObject && 
          <APComponentHeader header={`API Product: ${managedObject.apEntityId.displayName}`} />
        }

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObject && renderManagedObject() }

      </div>
      {/* DEBUG */}
      {/* <pre style={ { fontSize: '10px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre> */}
      {/* <pre style={ { fontSize: '10px' }} >
        apSearchContent={JSON.stringify(managedObject?.apSearchContent.split(','), null, 2)}
      </pre> */}
    </React.Fragment>
  );
}
