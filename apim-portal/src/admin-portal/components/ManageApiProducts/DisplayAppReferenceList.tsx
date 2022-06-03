
import React from "react";

import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { TAPAdminPortalApiProductDisplay } from "../../displayServices/APAdminPortalApiProductsDisplayService";
import { Loading } from "../../../components/Loading/Loading";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";
import APAdminPortalAppsDisplayService from "../../displayServices/APAdminPortalAppsDisplayService";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IDisplayAppReferenceListProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onSuccess: (apiCallState: TApiCallState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onViewAppReference: (appEntityId: TAPEntityId) => void;
}

export const DisplayAppReferenceList: React.FC<IDisplayAppReferenceListProps> = (props: IDisplayAppReferenceListProps) => {
  const ComponentName = 'DisplayAppReferenceList';

  const MessageNoManagedObjectsFound = 'No Apps defined.';

  type TManagedObject = TAPEntityId;
  type TManagedObjectList = Array<TManagedObject>;

  const [userContext] = React.useContext(UserContext);
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const dt = React.useRef<any>(null);


  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_REFERENCE_LIST, `retrieve app reference list for api product: ${props.apAdminPortalApiProductDisplay.apEntityId.displayName}, version: ${props.apAdminPortalApiProductDisplay.apVersionInfo.apCurrentVersion}`);
    try { 
      // const x = APAdminPortalAppsDisplayService.apiGetList_ApAppDisplay4ListList_For_AppEntityIdList({
      //   organizationId: props.organizationId,
      //   // default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
      //   appEntityIdList: props.apAdminPortalApiProductDisplay.apAppReferenceEntityIdList,

      // });
      setManagedObjectList(props.apAdminPortalApiProductDisplay.apAppReferenceEntityIdList);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setIsLoading(true);
    await apiGetManagedObjectList();
    setIsLoading(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setIsInitialized(true);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *
  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }  
  const onManagedObjectOpen = (event: any): void => {
    const mo: TManagedObject = event.data as TManagedObject;
    props.onViewAppReference(mo);
  }
  const nameBodyTemplate = (mo: TManagedObject): string => {
    return mo.displayName;
  }
  // const revisionBodyTemplate = (row: TManagedObject): JSX.Element => {
  //   return (<div>{row.apVersionInfo.apLastVersion}</div>);
  // }
  // const stateTemplate = (row: TManagedObject): string => {
  //   return row.apLifecycleStageInfo.stage;
  // }
  // const publishedTemplate = (row: TManagedObject): JSX.Element => {
  //   if(row.apPublishDestinationInfo.apExternalSystemEntityIdList.length === 0) return (<div>False</div>);
  //   return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList(row.apPublishDestinationInfo.apExternalSystemEntityIdList));
  // }
  const renderManagedObjectDataTable = () => {
    const dataKey = APEntityIdsService.nameOf('id');
    const sortField = APEntityIdsService.nameOf('displayName');
    // const dataKey = APAdminPortalAppsDisplayService.nameOf_ApEntityId('id');
    // const sortField = APAdminPortalAppsDisplayService.nameOf_ApEntityId('displayName');
    // const filterField = APAdminPortalApiProductsDisplayService.nameOf<TAPAdminPortalApiProductDisplay4List>('apSearchContent');
    // const stateSortField = APAdminPortalApiProductsDisplayService.nameOf_ApLifecycleStageInfo('stage');
    return (
      <div className="card">
        <DataTable
          ref={dt}
          className="p-datatable-sm"
          // autoLayout={true}
          resizableColumns 
          columnResizeMode="fit"
          showGridlines={false}
          header='App(s)'
          value={managedObjectList}
          selectionMode="single"
          selection={selectedManagedObject}
          onRowClick={onManagedObjectSelect}
          onRowDoubleClick={(e) => onManagedObjectOpen(e)}
          scrollable 
          // scrollHeight="800px" 
          dataKey={dataKey}
          // sorting
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
        >
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} sortField={sortField} sortable />
          {/* <Column header="Revision" headerStyle={{width: '7em' }} body={revisionBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
          <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} />
          <Column header="Published" headerStyle={{width: '7em'}} body={publishedTemplate} bodyStyle={{ verticalAlign: 'top' }} /> */}
        </DataTable>
     </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    if(managedObjectList.length === 0) {
      return (
        <React.Fragment>
          <Divider />
          {MessageNoManagedObjectsFound}
          <Divider />
        </React.Fragment>
      );
    }
    if(managedObjectList.length > 0) {
      return renderManagedObjectDataTable();
    } 
  }

  return (
    <React.Fragment>
      <div className="manage-apis">

        <Loading key={ComponentName} show={isLoading} />      

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        <div className="p-mt-2">
          {isInitialized && renderContent()}
        </div>

      </div>
    </React.Fragment>
  );
}
