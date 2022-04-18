
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { IAPEntityIdDisplay, TAPEntityId } from "../../utils/APEntityIdsService";
import { 
  TAPControlledChannelParameter, 
} from "../../displayServices/APApiProductsDisplayService";
import { TAPDeveloperPortalAppApiProductDisplayList } from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";

import "../APComponents.css";

export interface IAPDisplayApApiProductListControlledChannelParameterListProps {
  apAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  emptyApiProductDisplayListMessage: string;
  emptyControlledChannelParameterListMessage: string;
  className?: string;
}

export const APDisplayApApiProductListControlledChannelParameterList: React.FC<IAPDisplayApApiProductListControlledChannelParameterListProps> = (props: IAPDisplayApApiProductListControlledChannelParameterListProps) => {
  const ComponentName='APDisplayApApiProductListControlledChannelParameterList';

  type TManagedObject = IAPEntityIdDisplay & {
    apControlledChannelParameter: TAPControlledChannelParameter;
    apiProductInfo: string;
  }
  type TManagedObjectList = Array<TManagedObject>;

  const nameOf_ManagedObject = (name: keyof TManagedObject) => {
    return name;
  }
  const nameOf_ManagedObject_ApEntityId = (name: keyof TAPEntityId) => {
    return `${nameOf_ManagedObject('apEntityId')}.${name}`;
  }
  const nameOf_ApControlledChannelParameter_ApEntityId = (name: keyof TAPEntityId) => {
    return `${nameOf_ManagedObject('apControlledChannelParameter')}.${nameOf_ManagedObject('apEntityId')}.${name}`;
  }

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const dataTableRef = React.useRef<any>(null);

  const doInitialize = () => {
    const moList: TManagedObjectList = [];
    for(const apApiProductDisplay of props.apAppApiProductDisplayList) {
      for(const apControlledChannelParameter of apApiProductDisplay.apControlledChannelParameterList) {
        const mo: TManagedObject = {
          apEntityId: apApiProductDisplay.apEntityId,
          apControlledChannelParameter: apControlledChannelParameter,
          apiProductInfo: `v${apApiProductDisplay.apVersionInfo.apLastVersion} (${apApiProductDisplay.apApp_ApiProduct_Status}, ${apApiProductDisplay.apLifecycleInfo.apLifecycleState})`,
        };        
        moList.push(mo);
      }
    }
    setManagedObjectList(moList);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const rowGroupHeaderTemplate = (row: TManagedObject) => {
    // ${row.apVersionInfo.apLastVersion} (${row.apLifecycleInfo.apLifecycleState})
    return(
      <span className="p-text-bold">API Product: {row.apEntityId.displayName} - {row.apiProductInfo}</span>
    );
  }

  const rowGroupFooterTemplate = (row: TManagedObject) => { return(<></>); }

  const apiParameterValueBodyTemplate = (row: TManagedObject): JSX.Element => {
    return (
      <div>
        {row.apControlledChannelParameter.value}
      </div>
    );
  }

  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    const dataKey = nameOf_ManagedObject_ApEntityId('id');
    const sortField = nameOf_ManagedObject_ApEntityId('displayName');
    const parameterNameField = nameOf_ApControlledChannelParameter_ApEntityId('id');

    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={dataTableRef}
          value={managedObjectList}
          dataKey={dataKey}
          sortMode="single" 
          sortField={sortField} 
          sortOrder={1}
          scrollable 
          scrollHeight="200px" 
          resizableColumns 
          columnResizeMode="fit"
          groupField={sortField}
          rowGroupMode="subheader"
          // groupRowsBy={sortField} <- the new version?
          rowGroupHeaderTemplate={rowGroupHeaderTemplate}
          rowGroupFooterTemplate={rowGroupFooterTemplate}
        >
          <Column 
            header="Controlled Channel Parameter"
            field={parameterNameField} 
            style={{width: '20em'}} 
            // bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
          />
          <Column 
            header="Values"
            body={apiParameterValueBodyTemplate}
            // field={parameterValueField} 
            // bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
          />
        </DataTable>
        {/* DEBUG */}
        {/* <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(attributeList, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
    {managedObjectList && managedObjectList.length > 0 &&
      renderComponent()
    }
    {(props.apAppApiProductDisplayList.length === 0) && 
      <span>{props.emptyApiProductDisplayListMessage}</span>
    }
  </div>

  );
}
