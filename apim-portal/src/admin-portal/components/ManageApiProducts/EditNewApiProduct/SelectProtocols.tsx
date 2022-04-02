import React from "react";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

import APProtocolsDisplayService, { 
  TAPProtocolDisplayList 
} from "../../../../displayServices/APProtocolsDisplayService";

export interface ISelectProtocolsProps {
  complete_apProtocolDisplayList: TAPProtocolDisplayList;  
  selected_apProtocolDisplayList: TAPProtocolDisplayList;
  onSelectionChange: (apProtocolDisplayList: TAPProtocolDisplayList) => void;
}

export const SelectProtocols: React.FC<ISelectProtocolsProps> = (props: ISelectProtocolsProps) => {
  // const ComponentName = 'SelectProtocols';

  const [selected_ApProtocolDisplayList, setSelected_ApProtocolDisplayList] = React.useState<TAPProtocolDisplayList>();
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  const doInitialize = async () => {
    if(props.selected_apProtocolDisplayList.length === 0) setSelected_ApProtocolDisplayList(props.complete_apProtocolDisplayList);
    else setSelected_ApProtocolDisplayList(props.selected_apProtocolDisplayList)
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(selected_ApProtocolDisplayList === undefined) return;
    setIsInitialized(true);
  }, [selected_ApProtocolDisplayList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // const renderProtocolsSelectionTable = (): JSX.Element => {
  //   const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
  //     const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
  //     const className = `${options.className} p-jc-start`;
  //     const titleClassName = `${options.titleClassName} p-pl-1`;
  //     return (
  //       <div className={className} style={{ justifyContent: 'left'}} >
  //         <button className={options.togglerClassName} onClick={options.onTogglerClick}>
  //           <span className={toggleIcon}></span>
  //         </button>
  //         <span className={titleClassName}>
  //           Protocols
  //         </span>
  //       </div>
  //     );
  //   }
  //   if(selected_ApEnvironmentDisplayList.length === 0) return (<></>);
  //   const exposedProtocolList: TAPProtocolDisplayList = APEnvironmentsService.create_ConsolidatedApProtocolDisplayList(selected_ApEnvironmentDisplayList);
  //   return (  
  //     <React.Fragment>
  //       {displaySelectedProtocolsErrorMessage()}
  //       <Panel 
  //         headerTemplate={panelHeaderTemplate} 
  //         toggleable
  //         collapsed
  //       >
  //         {displaySelectedProtocolsErrorMessage()}
  //         <DataTable 
  //           className="p-datatable-sm"
  //           value={exposedProtocolList}
  //           // autoLayout={true}
  //           selection={selected_ApProtocolDisplayList}
  //           onSelectionChange={(e) => setSelected_ApProtocolDisplayList(e.value)}
  //           // sorting
  //           sortMode='single'
  //           sortField="connectorProtocol.name"
  //           sortOrder={1}          
  //           dataKey="apEntityId.id"
  //         >
  //           <Column selectionMode="multiple" style={{width:'3em'}} />
  //           <Column field="connectorProtocol.name" header="Protocol" style={{width: '20em'}} />
  //           <Column field="connectorProtocol.version" header="Version" />
  //         </DataTable>
  //       </Panel>
  //     </React.Fragment>
  //   );
  // }

  // const displaySelectedProtocolsErrorMessage = () => {
  //   if(isFormSubmitted && !isSelectedProtocolListValid()) return <p className="p-error">Select at least 1 protocol.</p>;
  // }

  const onSelectionChange = (apProtocolDisplayList: TAPProtocolDisplayList) => {
    setSelected_ApProtocolDisplayList(apProtocolDisplayList);
    props.onSelectionChange(apProtocolDisplayList);
  }

  const renderProtocolsSelectionTable = (): JSX.Element => {
    if(props.complete_apProtocolDisplayList.length === 0) return (<></>);
    const dataKey = APProtocolsDisplayService.nameOf_ApEntityId('id');
    const sortField = APProtocolsDisplayService.nameOf_ApEntityId('displayName');
    return (  
      <React.Fragment>
        {/* {displaySelectedProtocolsErrorMessage()} */}
        <DataTable 
          className="p-datatable-sm"
          value={props.complete_apProtocolDisplayList}
          // autoLayout={true}
          selection={selected_ApProtocolDisplayList}
          onSelectionChange={(e) => onSelectionChange(e.value)}
          // sorting
          sortMode='single'
          sortField={sortField}
          sortOrder={1}          
          dataKey={dataKey}
        >
          <Column selectionMode="multiple" style={{width:'3em'}} />
          <Column header="Protocol" style={{width: '20em'}} field={APProtocolsDisplayService.nameOf_connectorProtocol('name')} />
          <Column header="Version" field={APProtocolsDisplayService.nameOf_connectorProtocol('version')} />
        </DataTable>
      </React.Fragment>
    );

  }

  return(
    <div className="manage-api-products">

      { isInitialized && renderProtocolsSelectionTable() }

    </div>
  );
}

