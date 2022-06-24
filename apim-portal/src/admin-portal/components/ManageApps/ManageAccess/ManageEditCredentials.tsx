import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import APAdminPortalAppsDisplayService, { 
  TAPAdminPortalAppDisplay 
} from "../../../displayServices/APAdminPortalAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageAppsCommon";
import { EditApiProducts } from "./EditApiProducts";
import { EditChannelParameters } from "./EditChannelParameters";
import { DisplayAppHeaderInfo } from "../DisplayAppHeaderInfo";
import { OrganizationContext } from "../../../../components/APContextProviders/APOrganizationContextProvider";
import { TAPAppDisplay_Credentials } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApps.css";
import { SelectButton, SelectButtonChangeParams } from "primereact/selectbutton";
import { EditInternalCredentials } from "./EditInternalCredentials";

export interface IManageEditCredentialsProps {
  organizationId: string;
  apAdminPortalAppDisplay: TAPAdminPortalAppDisplay;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageEditCredentials: React.FC<IManageEditCredentialsProps> = (props: IManageEditCredentialsProps) => {
  const ComponentName = 'ManageEditCredentials';

  type TManagedObject = TAPAppDisplay_Credentials;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  // const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const doInitialize = async () => {
    setManagedObject(APAdminPortalAppsDisplayService.get_ApAppDisplay_Credentials({ 
      apAppDisplay: props.apAdminPortalAppDisplay 
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setRefreshCounter(refreshCounter + 1);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSaveSuccess = (apiCallState: TApiCallState) => {
    props.onSaveSuccess(apiCallState);
  }

  const onError = (apiCallStatus: TApiCallState) => {
    setApiCallStatus(apiCallStatus);
    props.onError(apiCallStatus);
  }

  const SelectInternalCredentialsId = "SelectInternalCredentialsId";
  const SelectExternalCredentialsId = "SelectExternalCredentialsId";
  const SelectCredentialOptions: TAPEntityIdList = [
    { id: SelectInternalCredentialsId, displayName: 'Internal Credentials' },
    { id: SelectExternalCredentialsId, displayName: 'External Credentials' },
  ];
  const [selectedCredentialsOptionId, setSelectedCredentialsOptionId] = React.useState<string>(SelectInternalCredentialsId);

  const renderSelectCredentialsButton = () => {
    const onSelectOptionChange = (params: SelectButtonChangeParams) => {
      if(params.value !== null) {
        setSelectedCredentialsOptionId(params.value);
      }
    }
    return(
      <SelectButton
        value={selectedCredentialsOptionId} 
        options={SelectCredentialOptions} 
        optionLabel={APEntityIdsService.nameOf('displayName')}
        optionValue={APEntityIdsService.nameOf('id')}
        onChange={onSelectOptionChange} 
        // style={{ textAlign: 'end' }}
      />
    );
  }

  const renderInternalCredentialsContent = () => {
    const funcName = 'renderInternalCredentialsContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return (
      <div>
        <EditInternalCredentials
          key={`${ComponentName}_EditCredentials_${refreshCounter}`}
          organizationId={props.organizationId}
          apAppDisplay_Credentials={managedObject}
          onCancel={props.onCancel}
          onError={onError}
          onLoadingChange={props.onLoadingChange}
          onSaveSuccess={onSaveSuccess}
        />
      </div>
    );
  }

  const renderExternalCredentialsContent = () => {
    const funcName = 'renderExternalCredentialsContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return (
      <div>
        <p>TODO: {logName} - implement me</p>
      </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(selectedCredentialsOptionId === undefined) throw new Error(`${logName}: selectedCredentialsOptionId === undefined`);
    return (
      <React.Fragment>
        <div className="p-mt-2">
          { selectedCredentialsOptionId === SelectInternalCredentialsId && renderInternalCredentialsContent() }
          { selectedCredentialsOptionId === SelectExternalCredentialsId && renderExternalCredentialsContent() }
        </div>              

        {/* <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Channel Parameters'>
            <React.Fragment>
              <EditChannelParameters
                key={`${ComponentName}_EditChannelParameters_${refreshCounter}`}
                organizationId={props.organizationId}
                apAdminPortalAppDisplay={managedObject}
                onSaveSuccess={onSaveSuccess_ChannelParameters}
                onCancel={props.onCancel}
                onError={onError}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='API Products'>
            <React.Fragment>
              <EditApiProducts
                key={`${ComponentName}_EditApiProducts_${refreshCounter}`}
                organizationId={props.organizationId}
                apAdminPortalAppDisplay={managedObject}
                onSaveSuccess={onSaveSuccess_ApiProducts}
                onCancel={props.onCancel}
                onError={onError}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Credentials'>
            <React.Fragment>
              <EditCredentials
                key={`${ComponentName}_EditCredentials_${refreshCounter}`}
                organizationId={props.organizationId}
                apAdminPortalAppDisplay={managedObject}
                onCancel={props.onCancel}
                onError={onError}
                onLoadingChange={props.onLoadingChange}
                onSaveSuccess={onSaveSuccess_Credentials}
              />
            </React.Fragment>
          </TabPanel>
        </TabView> */}
      </React.Fragment>
    ); 
  }

  return (
    <div className="ap-manage-apps">

      { managedObject && renderSelectCredentialsButton() }

      { managedObject && selectedCredentialsOptionId && renderContent() }

    </div>
  );

}