import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import APSingleOrganizationDisplayService, { IAPSingleOrganizationDisplay } from "../../../../displayServices/APOrganizationsDisplayService/APSingleOrganizationDisplayService";
import APSystemOrganizationsDisplayService, { IAPSystemOrganizationDisplay } from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import { E_CALL_STATE_ACTIONS, E_ManageOrganizations_Scope, TManageOrganizationsScope } from "../ManageOrganizationsCommon";
import { Globals } from "../../../../utils/Globals";
import { EditGeneral } from "./EditGeneral";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IManageEditOrganizationProps {
  organizationEntityId: TAPEntityId;
  scope: TManageOrganizationsScope;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToCommand: (organizationEntityId: TAPEntityId) => void;
  onNavigateToImportList: () => void;
}

export const ManageEditOrganization: React.FC<IManageEditOrganizationProps> = (props: IManageEditOrganizationProps) => {
  const ComponentName = 'ManageEditOrganization';

  type TManagedObject = IAPSystemOrganizationDisplay | IAPSingleOrganizationDisplay;

  const LogoutAllOrganizationUsersMsg = 'All users currently logged into this organization will have to login again after saving any changes.';

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  // * Api Calls *

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${props.organizationEntityId.displayName}`);
    const type: E_ManageOrganizations_Scope = props.scope.type;
    try {
      switch(type) {
        case E_ManageOrganizations_Scope.SYSTEM_ORGS:
          const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay = await APSystemOrganizationsDisplayService.apiGet_ApOrganizationDisplay({ organizationId: props.organizationEntityId.id });
          setManagedObject(apSystemOrganizationDisplay);
          break;
        case E_ManageOrganizations_Scope.ORG_SETTINGS:
          const apSingleOrganizationDisplay: IAPSingleOrganizationDisplay = await APSingleOrganizationDisplayService.apiGet_ApOrganizationDisplay({ organizationId: props.organizationEntityId.id });
          setManagedObject(apSingleOrganizationDisplay);
          break;
        case E_ManageOrganizations_Scope.ORG_STATUS:
          throw new Error(`${logName}: unsupported props.scope.type=${props.scope.type}`);  
        case E_ManageOrganizations_Scope.IMPORT_ORGANIZATION:
          const apImportableSystemOrganizationDisplay: IAPSystemOrganizationDisplay = await APSystemOrganizationsDisplayService.apiGet_Importable_ApOrganizationDisplay({ organizationId: props.organizationEntityId.id });
          setManagedObject(apImportableSystemOrganizationDisplay);
          break;
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

  const ManagedEdit_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.organizationEntityId);
  }
  const ManagedEdit_onNavigateToImportList = (e: MenuItemCommandParams): void => {
    props.onNavigateToImportList();
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = (moDisplayName: string) => {
    if(props.scope.type === E_ManageOrganizations_Scope.IMPORT_ORGANIZATION) {
      props.setBreadCrumbItemList([
        {
          label: 'Import an Organization',
          command: ManagedEdit_onNavigateToImportList
        },  
        {
          label: moDisplayName,
        },
      ]);
    } else {
      props.setBreadCrumbItemList([
        {
          label: moDisplayName,
          command: ManagedEdit_onNavigateToCommand
        },
        {
          label: 'Edit'
        }  
      ]);
    }
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setBreadCrumbItemList(managedObject.apEntityId.displayName);
    // setRefreshCounter(refreshCounter + 1);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onEdit_SaveSuccess = (apiCallState: TApiCallState) => {
    props.onSaveSuccess(apiCallState);
    if(props.scope.type === E_ManageOrganizations_Scope.IMPORT_ORGANIZATION) props.onCancel();
    else doInitialize();
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (<></>);
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
            // key={`${ComponentName}_EditGeneral_${refreshCounter}`}
            scope={props.scope}
            apOrganizationDisplay={managedObject}
            onCancel={props.onCancel}
            onError={props.onError}
            onSaveSuccess={onEdit_SaveSuccess}
            onLoadingChange={props.onLoadingChange}
          />
        </React.Fragment>
      </TabPanel>  
    );

    if(props.scope.type !== E_ManageOrganizations_Scope.IMPORT_ORGANIZATION) {
      tabPanels.push(
        <TabPanel header='Connectivity'>
          <React.Fragment>
            <p>EditConnectivity</p>
            {/* <EditConnectivity
              organizationId={props.organizationId}
              apAdminPortalApiProductDisplay={managedObject}
              onCancel={props.onCancel}
              onError={props.onError}
              onSaveSuccess={onEdit_SaveSuccess}
              onLoadingChange={props.onLoadingChange}
            /> */}
          </React.Fragment>
        </TabPanel>
      );
    } 
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
    if(props.scope.type === E_ManageOrganizations_Scope.IMPORT_ORGANIZATION) {
      return(
        <React.Fragment>
          <APComponentHeader 
            header={`Import Organization: ${managedObject.apEntityId.displayName}`} 
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <APComponentHeader 
            // key={`${ComponentName}_APComponentHeader_${refreshCounter}`}
            header={`Edit Organization: ${managedObject.apEntityId.displayName}`} 
          />
          <div className="p-mt-4 p-mb-4" style={{ color: 'red'}}>{LogoutAllOrganizationUsersMsg}</div>
        </React.Fragment>
      );
    }
  }

  return (
    <div className="manage-organizations">

      { managedObject && renderEditHeader() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && renderContent() }

    </div>
  );

}