
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { EnvironmentsService } from '@solace-iot-team/platform-api-openapi-client-fe';
import { TAPOrganizationId } from "../APComponentsCommon";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { TOrganizationService } from "./ManageEnvironmentsCommon";

import "../APComponents.css";
import "./ManageEnvironments.css";

export enum E_MANAGED_OBJECT_CALL_STATE_ACTIONS {
  API_GET_ORGANIZATION_SERVICE_LIST = "API_GET_ORGANIZATION_SERVICE_LIST"
}

export interface IListOrganizationServicesProps {
  organizationName: TAPOrganizationId;
  tableHeader: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onSelectOrganizationService: (organizationService: TOrganizationService) => void;
  onNoOrganizationServicesFound: () => void;
}

export const ListOrganizationServices: React.FC<IListOrganizationServicesProps> = (props: IListOrganizationServicesProps) => {
  const componentName = 'ListOrganizationServices';

  type TOrganizationServiceList = Array<TOrganizationService>;
  type TOrganizationServiceTableDataRow = TOrganizationService & {
    transformedServiceClassDisplayedAttributes: {
      highAvailability: string
    }
  }
  type TOrganizationServicesTableDataList = Array<TOrganizationServiceTableDataRow>;

  const transformOrganizationServiceToTableDataRow = (organizationService: TOrganizationService): TOrganizationServiceTableDataRow => {
    const highAvailability: string | undefined = organizationService.serviceClassDisplayedAttributes?.["High Availability"];
    const _tableDataRow: TOrganizationServiceTableDataRow = {
      ...organizationService,
      transformedServiceClassDisplayedAttributes: {
        highAvailability: highAvailability ? highAvailability : 'unknown'
      }
    }
    return _tableDataRow;
  }

  const transformOrganizationServiceListToTableDataList = (organizationServiceList: TOrganizationServiceList): TOrganizationServicesTableDataList => {
    return organizationServiceList.map( (organizationService: TOrganizationService) => {
      return transformOrganizationServiceToTableDataRow(organizationService);
    });
  }

  const transformTableDataRowToOrganizationService = (tableDataRow: TOrganizationServiceTableDataRow): TOrganizationService => {
    const { transformedServiceClassDisplayedAttributes, ...organizationService } = tableDataRow;
    return organizationService;
  }

  // * State *
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [organizationServiceList, setOrganizationServiceList] = React.useState<TOrganizationServiceList>([]);
  const [selectedOrganizationServiceTableDataRow, setSelectedOrganizationServiceTableDataRow] = React.useState<TOrganizationServiceTableDataRow>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const organizationServiceListDataTableRef = React.useRef<any>(null);
  const [organizationServiceListDataTableGlobalFilter, setOrganizationServiceListDataTableGlobalFilter] = React.useState<string>('');

  // * Api Calls *
  const apiGetOrganizationServiceList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetOrganizationServiceList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_MANAGED_OBJECT_CALL_STATE_ACTIONS.API_GET_ORGANIZATION_SERVICE_LIST, `retrieve service list for organization`);
    try { 
      const serviceList: TOrganizationServiceList = await EnvironmentsService.listServices(props.organizationName);
      setOrganizationServiceList(serviceList);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  
  // * useEffect Hooks *
  const doInitialize = async () => {
    setIsLoading(true);
    let apiCallState: TApiCallState = await apiGetOrganizationServiceList();
    setIsLoading(false);
  }

  React.useEffect(() => {
    const funcName = 'useEffect';
    const logName = `${componentName}.${funcName}()`;
    if(props.organizationName === '') throw new Error(`${logName}: props.organizationName is empty`);
    doInitialize();
  }, []);

  React.useEffect(() => {
    props.onLoadingChange(isLoading);
  }, [isLoading]);

  React.useEffect(() => {
    if(selectedOrganizationServiceTableDataRow) props.onSelectOrganizationService(transformTableDataRowToOrganizationService(selectedOrganizationServiceTableDataRow));
  }, [selectedOrganizationServiceTableDataRow]);

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_MANAGED_OBJECT_CALL_STATE_ACTIONS.API_GET_ORGANIZATION_SERVICE_LIST:
            if(organizationServiceList.length === 0) props.onNoOrganizationServicesFound();
            break;
          default:
        }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]);

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    setOrganizationServiceListDataTableGlobalFilter(event.currentTarget.value);
  }

  const onOrganizationServiceSelect = (event: any): void => {
    setSelectedOrganizationServiceTableDataRow(event.data);
  }  

  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <h4 className="p-m-0" style={{ width: '500px' }}>{props.tableHeader}</h4>
        <span className="p-input-icon-left" style={{ width: 'auto' }}>
          <i className="pi pi-search" />
          <InputText type="search" placeholder="Search ..." onInput={onInputGlobalFilter} style={{width: '500px'}}/>
        </span>
      </div>
    );
  }

  const renderOrganizationServiceListDataTable = () => {
    const funcName = 'renderOrganizationServiceListDataTable';
    const logName = `${componentName}.${funcName}()`;
    
    if(organizationServiceList.length === 0) throw new Error(`${logName}: organizationServiceList is empty`);
    
    const _organizationServicesTableDataList: TOrganizationServicesTableDataList = transformOrganizationServiceListToTableDataList(organizationServiceList);

    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={organizationServiceListDataTableRef}
          header={renderDataTableHeader()}
          value={_organizationServicesTableDataList}
          globalFilter={organizationServiceListDataTableGlobalFilter}
          selectionMode="single"
          selection={selectedOrganizationServiceTableDataRow}
          onRowClick={onOrganizationServiceSelect}
          // onSelectionChange={(e) => setSelectedOrganizationService(e.value)}
          sortMode="single" 
          sortField="name" 
          sortOrder={1}
          scrollable 
          scrollHeight="400px" 
          >
            <Column field="name" header="Service Name" sortable />
            <Column field="msgVpnName" header="Msg Vpn" sortable />
            <Column field="serviceId" header="Service Id" />
            <Column field="datacenterProvider" header="Datacenter Provider" />
            <Column field="datacenterId" header="Datacenter Id" />
            <Column field="serviceTypeId" header="Service Type" />
            <Column field="transformedServiceClassDisplayedAttributes.highAvailability" header="Availability" />
        </DataTable>
      </div>
    );
  }

  return (
    <div className="ap-environments">
      {!isLoading && organizationServiceList.length > 0 &&
        renderOrganizationServiceListDataTable()
      }
      {!isLoading && organizationServiceList.length === 0 &&
        <p className="p-error">No PubSub+ Services found.</p>
      }
    </div>
  );
}
