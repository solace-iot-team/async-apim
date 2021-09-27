
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import { 
  AdministrationService, 
  EnvironmentsService, 
  ApisService, 
  ApiProductsService, 
  DevelopersService, 
  AppsService 
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageOrganizationsCommon, TManagedObjectId, TViewManagedObject } from "./ManageOrganizationsCommon";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IViewOrganizationProps {
  organizationId: TManagedObjectId;
  organizationDisplayName: string;
  reInitializeTrigger: number,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewOrganization: React.FC<IViewOrganizationProps> = (props: IViewOrganizationProps) => {
  const componentName = 'ViewOrganization';

  type TManagedObject = TViewManagedObject;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${props.organizationDisplayName}`);
    try { 
      const apiOrganization = await AdministrationService.getOrganization({
        organizationName: props.organizationId
      });
      const envResponse = await EnvironmentsService.listEnvironments({
        organizationName: apiOrganization.name, 
        pageSize: 1,
        pageNumber: 1
      });        
      const apiResponse = await ApisService.listApis({
        organizationName: apiOrganization.name
      });
      const apiProductResponse = await ApiProductsService.listApiProducts({
        organizationName: apiOrganization.name, 
        pageSize: 1,
        pageNumber: 1
      });
      const developerResponse = await DevelopersService.listDevelopers({
        organizationName: apiOrganization.name, 
        pageSize: 1, 
        pageNumber: 1
      });
      const appResponse = await AppsService.listApps({
        organizationName: apiOrganization.name, 
        pageSize: 1,
        pageNumber: 1
      });
      setManagedObject(ManageOrganizationsCommon.transformViewApiObjectToViewManagedObject(apiOrganization, {
          hasEnvironments: envResponse.length > 0,
          hasApis: apiResponse.length > 0,
          hasApiProducts: apiProductResponse.length > 0,
          hasApps: appResponse.length > 0,
          hasDevelopers: developerResponse.length > 0
        }));
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
    doInitialize();
  }, [props.reInitializeTrigger]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const dataTableList = [managedObject];
    let expandedRows: any = {};
    expandedRows[`${dataTableList[0].id}`] = true;

    const rowExpansionTemplate = (managedObject: TManagedObject) => {

      const dataTableList = [managedObject];
  
      return (
        <div className="sub-table">
          <DataTable 
            className="p-datatable-sm"
            value={dataTableList}
            autoLayout={true}
            dataKey="id"
          >
            <Column field="hasInfo.hasEnvironments" header="Environments" body={ManageOrganizationsCommon.hasEnvironmentsBodyTemplate} />
            <Column field="hasInfo.hasApis" header="APIs" body={ManageOrganizationsCommon.hasApisBodyTemplate} />
            <Column field="hasInfo.hasApiProducts" header="API Products" body={ManageOrganizationsCommon.hasApiProductsBodyTemplate}/>
            <Column field="hasInfo.hasDevelopers" header="Developers" body={ManageOrganizationsCommon.hasDevelopersBodyTemplate} />
            <Column field="hasInfo.hasApps" header="Apps" body={ManageOrganizationsCommon.hasAppsBodyTemplate}/>
          </DataTable>
        </div>
      );
    }

    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={dt}
          autoLayout={true}
          value={dataTableList}
          expandedRows={expandedRows}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="id"  
          >
            <Column field="displayName" header="Name" />
            <Column field="type" header="Type" />
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-users">

      <APComponentHeader header={`Organization: ${props.organizationDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
