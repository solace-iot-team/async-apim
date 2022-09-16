
import React from "react";

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import APEpSettingsDisplayService, { IAPEpSettingsDisplay } from "../../../../displayServices/APEpSettingsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageEpSettingsCommon";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { DisplayEpSettingMappings } from "./DisplayEpSettingMappings";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IViewEpSettingProps {
  organizationId: string;
  apEpSettingEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onLoadSuccess: (apEpSettingsDisplay: IAPEpSettingsDisplay) => void;
}

export const ViewEpSetting: React.FC<IViewEpSettingProps> = (props: IViewEpSettingProps) => {
  const ComponentName = 'ViewEpSetting';

  type TManagedObject = IAPEpSettingsDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET, 'get ep setting');
    try {
      const apEpSettingsDisplay: IAPEpSettingsDisplay = await APEpSettingsDisplayService.apiGet_ApEpSettingsDisplay({
        organizationId: props.organizationId,
        id: props.apEpSettingEntityId.id
      });
      setManagedObject(apEpSettingsDisplay);
    } catch(e: any) {
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

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    props.onLoadSuccess(managedObject);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderConfig = () => {
    const funcName = 'renderConfig';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return(
      <React.Fragment> 
        {/* <div className="p-mb-2 p-mt-4 ap-display-component-header">Mappings:</div> */}
        {/* <div className="p-ml-4"> */}
          <DisplayEpSettingMappings 
            apEpSettings_MappingList={managedObject.apEpSettings_MappingList}
          />
        {/* </div> */}
      </React.Fragment>
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <div className="p-col-12">
        <div className="organization-view">
          <div className="detail-left">
            {renderConfig()}
          </div>
          <div className="detail-right">
            <div>Id: {managedObject.apEntityId.id}</div>
          </div>            
        </div>
      </div>      
    );
  }

  return (
    <div className="manage-organizations">

      { managedObject && <APComponentHeader header={`Configuration: ${managedObject.apEntityId.displayName}`} /> }

      { managedObject && renderManagedObject() }

    </div>
  );
}
