
import React from "react";
import { useHistory } from 'react-router-dom';

import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";

import { 
  CommonName,
  CommonDisplayName,
  ApisService,
  CommonEntityNameList,
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APManagedApiDisplay, TAPDeveloperPortalApiDisplay } from "../../../components/deleteme.APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalExploreApisCommon";
import { APConnectorApiCalls, TGetAsyncApiSpecResult } from "../../../utils/APConnectorApiCalls";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { TAPDeveloperPortalApiProductCatalogCompositeId } from "../DeveloperPortalProductCatalog/deleteme.DeveloperPortalProductCatalogCommon";
import { EUIDeveloperPortalResourcePaths } from "../../../utils/Globals";

import '../../../components/APComponents.css';
import "./DeveloperPortalExploreApis.css";

export interface IDeveloperPortalViewApiProps {
  organizationId: CommonName;
  apiId: CommonName;
  apiDisplayName: CommonDisplayName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalViewApi: React.FC<IDeveloperPortalViewApiProps> = (props: IDeveloperPortalViewApiProps) => {
  const componentName = 'DeveloperPortalViewApi';

  type TManagedObject = TAPDeveloperPortalApiDisplay;
  type TManagedObjectDisplay = TManagedObject;

  const transformManagedObjectToDisplay = (mo: TManagedObject): TManagedObjectDisplay => {
    return mo;
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObjectDisplay>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const productCatalogHistory = useHistory<TAPDeveloperPortalApiProductCatalogCompositeId>();

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_DETAILS, `retrieve details for api: ${props.apiDisplayName}`);
    try { 
      const result: TGetAsyncApiSpecResult = await APConnectorApiCalls.getAsyncApiSpec(props.organizationId, props.apiId, callState);
      if(result.apiCallState.success && result.apiInfo && result.asyncApiSpec) {
        const apiApiProductEntityNameList: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
          organizationName: props.organizationId,
          apiName: result.apiInfo.name
        });
        if(apiApiProductEntityNameList.length === 0) throw new Error(`${logName}: apiApiProductEntityNameList.length === 0`);
        setManagedObject(transformManagedObjectToDisplay(APManagedApiDisplay.createAPDeveloperPortalApiDisplayFromApiEntities(result.apiInfo, apiApiProductEntityNameList, result.asyncApiSpec)));
      } else callState = result.apiCallState;
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderApiProductButtons = (usedBy_ApiProductEntityNameList: CommonEntityNameList): JSX.Element => {
    const funcName = 'renderApiProductButtons';
    const logName = `${componentName}.${funcName}()`;

    const defaultButtonStyle: React.CSSProperties = {
      whiteSpace: 'nowrap', 
      // padding: 'unset', 
      // width: 'unset' 
    }
  
    const onClick = (event: any): void => {
      const id: CommonName = event.currentTarget.dataset.id;
      const displayName: CommonDisplayName = event.currentTarget.dataset.display_name;
      // alert(`show api product: id=${id}, displayName=${displayName}`);
      productCatalogHistory.push({
        pathname: EUIDeveloperPortalResourcePaths.DELETEME_ExploreApiProducts,
        state: {
          apiProductId: id,
          apiProductDisplayName: displayName
        }
      });
    }

    const renderButtons = (jsxButtonList: Array<JSX.Element>) => {
      return (
        <div className="p-grid">
          {jsxButtonList}
        </div>
      );
    }
    
    if(usedBy_ApiProductEntityNameList.length === 0) throw new Error(`${logName}: usedBy_ApiProductEntityNameList.length === 0`);

    let jsxButtonList: Array<JSX.Element> = [];
    for (const entityName of usedBy_ApiProductEntityNameList) {
      jsxButtonList.push(
        <Button 
          label={entityName.displayName} 
          key={componentName + entityName.name} 
          data-id={entityName.name} 
          data-display_name={entityName.displayName}
          data-entity_name={entityName}
          className="p-button-text p-button-plain p-button-outlined" 
          style={defaultButtonStyle}          
          onClick={onClick}
        />        
      );
    }

    return (
      <Toolbar         
        style={{ 
          background: 'none',
          border: 'none'
        }} 
        left={renderButtons(jsxButtonList)}
      />
    );
  }

  const renderManagedObject = (mo: TManagedObject) => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!mo.apAsyncApiSpec) throw new Error(`${logName}: mo.apAsyncApiSpec is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="view">
            <div className="detail-left">

              <div className="p-text-bold">API Products:</div>
              <div className="p-ml-2">{renderApiProductButtons(mo.apiUsedBy_ApiProductEntityNameList)}</div>
              
              <Divider />
              <APDisplayAsyncApiSpec 
                schema={mo.apAsyncApiSpec.spec} 
                schemaId={mo.apName}
                onDownloadError={props.onError}
                onDownloadSuccess={props.onSuccess}
              />

            </div>
            <div className="detail-right">
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  return (
    <div className="adp-explore-apis">

      <APComponentHeader header={`API: ${props.apiDisplayName}`} />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject(managedObject) }

    </div>
  );
}
