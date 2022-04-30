
import React from "react";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { Globals } from "../../../utils/Globals";
import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APSystemOrganizationsDisplayService, { IAPSystemOrganizationDisplay } from "../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import APSingleOrganizationDisplayService, { IAPSingleOrganizationDisplay } from "../../../displayServices/APOrganizationsDisplayService/APSingleOrganizationDisplayService";
import { E_CALL_STATE_ACTIONS, E_DISPLAY_ORGANIZATION_SCOPE, E_ManageOrganizations_Scope, TManageOrganizationsScope } from "./ManageOrganizationsCommon";
import { DisplayOrganization } from "./DisplayOrganization";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IViewOrganizationProps {
  organizationEntityId: TAPEntityId;
  scope: TManageOrganizationsScope;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (organizationEntityId: TAPEntityId) => void;
}

export const ViewOrganization: React.FC<IViewOrganizationProps> = (props: IViewOrganizationProps) => {
  const componentName = 'ViewOrganization';

  type TManagedObject = IAPSystemOrganizationDisplay | IAPSingleOrganizationDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);

  // const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${props.organizationEntityId.displayName}`);
    const type: E_ManageOrganizations_Scope = props.scope.type;
    try {
      switch(type) {
        case E_ManageOrganizations_Scope.SYSTEM_ORGS:
        case E_ManageOrganizations_Scope.IMPORT_ORGANIZATION:
          const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay = await APSystemOrganizationsDisplayService.apiGet_ApOrganizationDisplay({ organizationId: props.organizationEntityId.id });
          setManagedObject(apSystemOrganizationDisplay);
          break;
        case E_ManageOrganizations_Scope.ORG_SETTINGS:
          const apSingleOrganizationDisplay: IAPSingleOrganizationDisplay = await APSingleOrganizationDisplayService.apiGet_ApOrganizationDisplay({ organizationId: props.organizationEntityId.id });
          setManagedObject(apSingleOrganizationDisplay);
          break;
        case E_ManageOrganizations_Scope.ORG_STATUS:
          throw new Error(`${logName}: unsupported props.scope.type=${props.scope.type}`);  
        default:
          Globals.assertNever(logName, type);
      }
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ViewOrganization_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(props.organizationEntityId);
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
        command: ViewOrganization_onNavigateHereCommand
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

  const get_DisplayOrganizationScope = (): E_DISPLAY_ORGANIZATION_SCOPE => {
    const funcName = 'get_DisplayOrganizationScope';
    const logName = `${componentName}.${funcName}()`;
    if(props.scope.type === E_ManageOrganizations_Scope.SYSTEM_ORGS) return E_DISPLAY_ORGANIZATION_SCOPE.VIEW_SYSTEM_ORG;
    if(props.scope.type === E_ManageOrganizations_Scope.ORG_SETTINGS) return E_DISPLAY_ORGANIZATION_SCOPE.VIEW_ORG_SETTINGS;
    throw new Error(`${logName}: unsupported props.scope.type = ${props.scope.type}`);
  }

  return (
    <div className="manage-organizations">

      { managedObject && <APComponentHeader header={`Organization: ${managedObject.apEntityId.displayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && 
        <DisplayOrganization
          scope={get_DisplayOrganizationScope()}
          apOrganizationDisplay={managedObject}
        />
      }

    </div>
  );
}
