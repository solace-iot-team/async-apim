
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay } from "../../displayServices/APAdminPortalApiProductsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";
import { DisplayAdminPortalApiProduct, E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE } from "./DisplayApiProduct";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IViewApiProductProps {
  organizationId: string;
  apiProductEntityId: TAPEntityId;
  onInitialized: (apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay) => void;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (apiProductEntityId: TAPEntityId) => void;
  selectRevisionEnabled: boolean;
}

export const ViewApiProduct: React.FC<IViewApiProductProps> = (props: IViewApiProductProps) => {
  const ComponentName = 'ViewApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [userContext] = React.useContext(UserContext);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apiProductEntityId.displayName}`);
    try { 
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await APAdminPortalApiProductsDisplayService.apiGet_AdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apiProductEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        fetch_revision_list: true
      });
      // console.log(`${logName}: apAdminPortalApiProductDisplay = ${JSON.stringify(apAdminPortalApiProductDisplay, null, 2)}`);
      setManagedObject(apAdminPortalApiProductDisplay);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ViewApiProduct_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(props.apiProductEntityId);
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
        command: ViewApiProduct_onNavigateHereCommand
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
    props.onInitialized(managedObject);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <React.Fragment>
      <div className="manage-api-products">

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && 
        <DisplayAdminPortalApiProduct
          scope={props.selectRevisionEnabled ? E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING : E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_REFEREMCED_BY}
          organizationId={props.organizationId}
          apAdminPortalApiProductDisplay={managedObject}
          onError={props.onError}
          onSuccess={props.onSuccess}
          onLoadingChange={props.onLoadingChange}
        />
      }

      </div>
    </React.Fragment>
  );
}
