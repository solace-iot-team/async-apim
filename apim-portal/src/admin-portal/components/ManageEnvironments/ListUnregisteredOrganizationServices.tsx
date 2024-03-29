
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';

import { EnvironmentListItem, EnvironmentsService } from '@solace-iot-team/apim-connector-openapi-browser';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { TOrganizationService } from "./ManageEnvironmentsCommon";

import '../../../components/APComponents.css';
import "./ManageEnvironments.css";

export enum E_MANAGED_OBJECT_CALL_STATE_ACTIONS {
  API_GET_AVAILABLE_ORGANIZATION_SERVICE_LIST = "API_GET_AVAILABLE_ORGANIZATION_SERVICE_LIST"
}

export interface IListUnregisteredOrganizationServicesProps {
  organizationName: string;
  tableHeader: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onSelectOrganizationService: (organizationService: TOrganizationService) => void;
  onNoOrganizationServicesFound: () => void;
}

export const ListUnregisteredOrganizationServices: React.FC<IListUnregisteredOrganizationServicesProps> = (props: IListUnregisteredOrganizationServicesProps) => {
  const componentName = 'ListUnregisteredOrganizationServices';

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
  const [availableOrganizationServiceList, setAvailableOrganizationServiceList] = React.useState<TOrganizationServiceList>([]);
  const [selectedOrganizationServiceTableDataRow, setSelectedOrganizationServiceTableDataRow] = React.useState<TOrganizationServiceTableDataRow>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const organizationServiceListDataTableRef = React.useRef<any>(null);
  const [organizationServiceListDataTableGlobalFilter, setOrganizationServiceListDataTableGlobalFilter] = React.useState<string>('');

  // * Api Calls *
  const apiGetAvailableOrganizationServiceList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetAvailableOrganizationServiceList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_MANAGED_OBJECT_CALL_STATE_ACTIONS.API_GET_AVAILABLE_ORGANIZATION_SERVICE_LIST, `retrieve available service list for organization`);
    try { 
      const _entireServiceList: TOrganizationServiceList = await EnvironmentsService.listServices({ 
        organizationName: props.organizationName
      });
      const _environmentList: Array<EnvironmentListItem> = await EnvironmentsService.listEnvironments({
        organizationName: props.organizationName
      });
      let _availableServiceList: TOrganizationServiceList = [];
      _entireServiceList.forEach( (_service: TOrganizationService) => {
        const exists = _environmentList.find( (env: EnvironmentListItem) => {
          return _service.serviceId === env.serviceId;
        });
        if(!exists) _availableServiceList.push(_service);
      });
      setAvailableOrganizationServiceList(_availableServiceList);
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
    await apiGetAvailableOrganizationServiceList();
    setIsLoading(false);
  }

  React.useEffect(() => {
    const funcName = 'useEffect';
    const logName = `${componentName}.${funcName}()`;
    if(props.organizationName === '') throw new Error(`${logName}: props.organizationName is empty`);
    doInitialize(); 
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    props.onLoadingChange(isLoading);
  }, [isLoading]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(selectedOrganizationServiceTableDataRow) props.onSelectOrganizationService(transformTableDataRowToOrganizationService(selectedOrganizationServiceTableDataRow));
  }, [selectedOrganizationServiceTableDataRow]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_MANAGED_OBJECT_CALL_STATE_ACTIONS.API_GET_AVAILABLE_ORGANIZATION_SERVICE_LIST:
            if(availableOrganizationServiceList.length === 0) props.onNoOrganizationServicesFound();
            break;
          default:
        }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
    
    if(availableOrganizationServiceList.length === 0) throw new Error(`${logName}: organizationServiceList is empty`);
    
    const _organizationServicesTableDataList: TOrganizationServicesTableDataList = transformOrganizationServiceListToTableDataList(availableOrganizationServiceList);

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
      {!isLoading && availableOrganizationServiceList.length > 0 &&
        renderOrganizationServiceListDataTable()
      }
      {!isLoading && availableOrganizationServiceList.length === 0 &&
        <p className="p-error">No available PubSub+ Services found.</p>
      }
    </div>
  );
}
