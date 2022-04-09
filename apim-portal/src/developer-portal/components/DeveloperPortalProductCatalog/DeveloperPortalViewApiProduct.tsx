
import React from "react";

import { MenuItem } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalProductCatalogCommon";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APDeveloperPortalApiProductsDisplayService, { TAPDeveloperPortalApiProductDisplay } from "../../displayServices/APDeveloperPortalApiProductsDisplayService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { DisplayDeveloperPortalApiProduct } from "./DisplayApiProduct";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";

export interface IDeveloperPortalViewApiProductProps {
  organizationId: string;
  apiProductEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const DeveloperPortalViewApiProduct: React.FC<IDeveloperPortalViewApiProductProps> = (props: IDeveloperPortalViewApiProductProps) => {
  const componentName = 'DeveloperPortalViewApiProduct';

  type TManagedObject = TAPDeveloperPortalApiProductDisplay;

  const [userContext] = React.useContext(UserContext);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT, `retrieve details for product: ${props.apiProductEntityId.displayName}`);
    try { 
      const object: TAPDeveloperPortalApiProductDisplay = await APDeveloperPortalApiProductsDisplayService.apiGet_DeveloperPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apiProductEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        fetch_revision_list: true,
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
      }
    ]);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setBreadCrumbItemList(managedObject.apEntityId.displayName);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className="adp-productcatalog">

      {/* <ApiCallStatusError apiCallStatus={apiCallStatus} /> */}

      { managedObject && 
        <DisplayDeveloperPortalApiProduct
          organizationId={props.organizationId}
          apDeveloperPortalApiProductDisplay={managedObject}
          userBusinessGroupId={userContext.runtimeSettings.currentBusinessGroupEntityId?.id}
          userId={userContext.apLoginUserDisplay.apEntityId.id}
          onError={props.onError}
          onSuccess={props.onSuccess}
          onLoadingChange={props.onLoadingChange}
        />
      }

    </div>
  );
}
